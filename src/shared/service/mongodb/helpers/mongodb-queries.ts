import type { MongodbLocation, MongodbLookup, MongodbRecord, MongodbSummarize } from '../models';
import { MongoDbScheme } from '../models';
import { $toObjectId } from './object-id';
import config from '../../../../config';
import { UserLocation } from '../../../../api/user/models';

const DEFAULT_LANGUAGE = config.DEFAULT_LANGUAGE;

const _extractConditionKey = (conditionKey: string): { key: string; condition: string } => {
  const idx = /[A-Z]/g.exec(conditionKey)?.index;
  let key = conditionKey.slice(idx);
  key = key.charAt(0).toLowerCase() + key.slice(1);
  let condition = conditionKey.slice(0, idx);

  return { key, condition };
};

const $match = ($match: Record<string, any>): Record<string, any> => {
  return { $match };
};

const $set = ($set: Record<string, any>): Record<string, any> => {
  return { $set };
};

const $unset = ($unset: Record<string, any>): Record<string, any> => {
  return { $unset };
};

const $expr = ($expr: Record<string, any>): Record<string, any> => {
  return { $expr };
};

const $addFields = ($addFields: Record<string, any>): Record<string, any> => {
  return { $addFields };
};

const $geoNear = (coordinates: UserLocation['coordinates'], distanceField: string = 'distance', spherical: boolean = true): Record<string, any> => {
  return { $geoNear: { near: { type: 'Point', coordinates }, distanceField: 'distance', spherical: true } };
};

const $regexMatch = (input: `${string}` | Record<string, any>, regex: string, options: string = 'i') => {
  return { $regexMatch: { input, regex, options } };
};

const $mergeObjectToRoot = (arrayElement: string): Array<Record<string, any>> => {
  return [
    { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$' + arrayElement, 0] }, '$$ROOT'] } } },
    { $project: { [arrayElement]: 0 } },
  ];
};

const $lookup = <Source, Scheme = Source>(lookup: MongodbLookup<Scheme, Source>): Record<string, any> => {
  const { foreignField = '_id', localField = '_id' } = lookup;

  return { $lookup: { localField, foreignField, as: (lookup.as || lookup.from)!, ...lookup } };
};

const $lookups = <Source, Scheme = Source>(
  lookups: Array<MongodbLookup<Scheme, Source>>,
  config?: { mergeToRoot?: boolean; saveLocalField?: boolean; setFirstElem?: boolean }
): Array<Record<string, any>> => {
  const { mergeToRoot, setFirstElem } = config || {};

  const lookup = (lookupOption: MongodbLookup<Scheme, Source>, map: Array<Record<string, any>> = []): Array<Record<string, any>> => {
    const { from, foreignField = '_id', localField = '_id', as, pipeline } = lookupOption;

    return [
      $lookup({ from, localField, foreignField, as: (as || from)!, pipeline: [...map, ...(pipeline || [])] }),
      ...(setFirstElem ? [$set({ [as || from]: { $first: `$${as || from}` } })] : []),
      ...(mergeToRoot ? [$mergeToRoot(`$${as || from}`)] : []),
    ];
  };

  const query = lookups.reverse().reduce((map: Array<Record<string, any>>, lookupOption) => lookup(lookupOption, map), []);
  const { as } = query[0].$lookup;

  return [...query, ...(setFirstElem ? [{ $set: { [as]: { $first: `$${as}` } } }] : []), ...(mergeToRoot ? $mergeObjectToRoot(as) : [])];
};

const $distance = (coordinates?: MongodbLocation['coordinates'], maxDistance?: number): Record<any, any> => {
  return coordinates ? { $geoNear: { near: { type: 'Point', coordinates }, distanceField: 'distance', spherical: true } } : {};
};

const $translate = <Source>(fieldName: keyof Source, activeLanguage?: string): Record<any, any> => {
  const key = fieldName as string;

  return $set({
    [fieldName]: {
      $cond: {
        if: { $ifNull: [`$${key}.${activeLanguage}`, false] },
        then: `$${key}.${activeLanguage}`,
        else: `$${key}.${DEFAULT_LANGUAGE}`,
      },
    },
  });
};

const $unionWith = (collectionName: string, pipeline: Array<Record<string, any>>): Record<string, any> => {
  return {
    $unionWith: {
      coll: collectionName,
      pipeline,
    },
  };
};

const $record = <Source, Scheme = Source>(
  options: MongodbRecord<Scheme, Source> | Array<MongodbRecord<Scheme, Source>>,
  config?: { mergeToRoot?: boolean; saveLocalField?: boolean }
): Array<Record<string, any>> => {
  return [
    $lookups(
      (Array.isArray(options) ? options : [options]).map(({ scheme, pipeline, foreignField, as, ...rest }) => ({
        foreignField: foreignField || '_id',
        pipeline: scheme || pipeline?.length ? [...(pipeline || []), ...(scheme ? [{ $project: scheme }] : [])] : undefined,
        as: as || (rest.localField as string),
        ...rest,
      })),
      config
    ),
  ];
};

const $summarize = (options: MongodbSummarize): Array<Record<string, any>> => {
  const { fields, from, as, returnField } = options;

  const dynamicQuery = Object.entries(fields).reduce(
    (query: Record<string, any>, [field, cmd]) => ({ ...query, [`${as}.${field}`]: { [`$${cmd}`]: `$${from}.${field}` } }),
    {}
  );

  return [
    {
      $set: {
        ...dynamicQuery,
        [`${as}.total`]: { $size: `$${from}` },
        ...(returnField?.value
          ? {
              [`${as}.${returnField.as}`]: {
                $arrayElemAt: [{ $filter: { input: `$${from}`, cond: { $eq: [`$$this.${returnField.from}`, $toObjectId(returnField.value)] } } }, 0],
              },
            }
          : {}),
      },
    },
    { $unset: [from, ...(returnField?.removeFields || []).map((field) => `${as}.${returnField?.as}.${field}`)] },
  ];
};

const $sort = ($sort: Record<string, any>): Record<string, any> => {
  return { $sort };
};

const $filter = (filter: Record<string, any> = {}): Record<string, any> => {
  const conditions = Object.entries(filter).reduce((filters: Record<string, any>, [cKey, value]) => {
    if (!value) {
      return filters;
    }

    const { key, condition } = _extractConditionKey(cKey);
    switch (condition) {
      case 'in':
        return { ...filters, [key]: { $regex: filter[cKey], $options: 'i' } };
      case 'sw':
        return { ...filters, [key]: { $regex: `^${filter[cKey]}`, $options: 'i' } };
      case 'ew':
        return { ...filters, [key]: { $regex: `${filter[cKey]}$`, $options: 'i' } };
      default:
        return { ...filters, [key]: { ['$' + condition]: filter[cKey] } };
    }
  }, {});

  return { $match: conditions };
};

const $project = <Scheme>(scheme: MongoDbScheme<Scheme>): Record<string, any> => {
  return { $project: scheme };
};

const $summary = (fields: Array<{ field: string; value?: string; name?: string }>): Record<string, any> => {
  return {
    $addFields: fields.reduce(
      (map: Record<string, any>, { field, value, name }) => ({
        [name || field]: { $sum: { $cond: value ? [{ eq: [`$${field}`, value] }, 1, 0] : [`$${field}`, 1, 0] } },
        ...map,
      }),
      {}
    ),
  };
};

const $mergeToRoot = (mergeField: `$${string}` | Record<string, any>): Record<string, any> => {
  return {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [mergeField, '$$ROOT'],
      },
    },
  };
};

export {
  $match,
  $set,
  $unset,
  $expr,
  $addFields,
  $geoNear,
  $regexMatch,
  $mergeObjectToRoot,
  $lookup,
  $lookups,
  $distance,
  $translate,
  $unionWith,
  $record,
  $summarize,
  $filter,
  $sort,
  $project,
  $mergeToRoot,
  $summary,
};
