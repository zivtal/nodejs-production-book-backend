import type { BaseId } from '../../shared/models';
import type { DbQuery } from '../../shared/service/mongodb/mongo-db.service';
import { $expr, $geoNear, $lookup, $match, $project, $regexMatch, $set, $sort, $summarize, $toObjectId } from '../../shared/service/mongodb/helpers';
import { jobTypeRecord, skillsRecord } from '../job/query';
import { DbCollection } from '../../shared/service/mongodb/constants';
import { PROFILE_EXTEND_DETAILS_SCHEME, PROFILE_FULL_DETAILS_SCHEME } from './constants';
import { GET_EMPLOYEE_DETAILS, LIST_COMPANIES, SEARCH_EMPLOYEES } from './employee.map';
import { EmployeeSearchReq } from './models';
import { USER_CONFIGURATION } from '../user/user.constants';

const listCompaniesQuery = (query: string): DbQuery => {
  return [
    $match({ $and: [{ company: { $exists: true } }, { company: { $ne: '' } }, { company: { $regex: query, $options: 'i' } }] }),
    { $group: { _id: 0, companies: { $addToSet: '$company' } } },
    $project({ _id: 0 }),
  ];
};

const searchEmployeesQuery = ({ coordinates, ...payload }: EmployeeSearchReq, language?: string): DbQuery => {
  const sort = coordinates
    ? [
        $geoNear(coordinates),
        $set({ inRadius: { $round: [{ $divide: ['$distance', 100000] }, 0] } }),
        $sort({ inRadius: 1, [`${USER_CONFIGURATION}.lastSeenAt`]: -1 }),
      ]
    : [$sort({ [`${USER_CONFIGURATION}.lastSeenAt`]: -1 })];

  const match: Record<string, any> = $match({
    $and: [
      { [`${USER_CONFIGURATION}.isActivated`]: true },
      ...(payload.search ? [$expr($regexMatch({ $concat: ['$firstName', ' ', '$lastName', ' ', '$company'] }, payload.search))] : []),
      ...(payload.specialization?.length ? [{ specialization: { $in: payload.specialization } }] : []),
      ...(payload.skills?.length ? [{ skills: { $in: payload.skills } }] : []),
      ...(payload.maxDistance && coordinates ? [{ distance: { $lte: payload.maxDistance } }] : []),
    ],
  });

  return [
    sort,
    match,
    skillsRecord(language, 'skills'),
    jobTypeRecord(language, 'specialization'),
    $lookup({ from: DbCollection.REVIEWS, foreignField: 'userId' }),
    $summarize({ fields: { average: 'avg' }, from: DbCollection.REVIEWS, as: 'rating' }),
    $set({ cover: '$cover.thumbData' }),
    $project(PROFILE_EXTEND_DETAILS_SCHEME),
  ];
};

const getEmployeeDetailsQuery = (userId: BaseId, senderId?: BaseId, language?: string): DbQuery => {
  return [
    $match({ _id: $toObjectId(userId) }),
    skillsRecord(language, 'skills'),
    jobTypeRecord(language, 'specialization'),
    $set({ cover: '$cover.fileData' }),
    $lookup({ from: DbCollection.REVIEWS, foreignField: 'userId', pipeline: [{ $project: { _id: 0, userId: 0 } }] }),
    $summarize({
      fields: { attitude: 'avg', reliability: 'avg', craftsmanship: 'avg', communication: 'avg', average: 'avg' },
      from: DbCollection.REVIEWS,
      as: 'rating',
      returnField: { from: 'fromId', as: 'review', value: senderId, removeFields: ['fromId', 'average'] },
    }),
    userId !== senderId ? [$project(PROFILE_FULL_DETAILS_SCHEME)] : [],
  ];
};

export default {
  [SEARCH_EMPLOYEES]: searchEmployeesQuery,
  [GET_EMPLOYEE_DETAILS]: getEmployeeDetailsQuery,
  [LIST_COMPANIES]: listCompaniesQuery,
};
