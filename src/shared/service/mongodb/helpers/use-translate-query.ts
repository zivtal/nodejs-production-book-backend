import config from '../../../../config';

const DEFAULT_LANGUAGE = config.DEFAULT_LANGUAGE;

export const useTranslateQuery = <Source>(field: keyof Source, language: string = DEFAULT_LANGUAGE): Record<any, any> => {
  const fieldName = field as string;

  return {
    $set: {
      [fieldName]: {
        $cond: {
          if: { $ifNull: [`$${fieldName}.${language}`, false] },
          then: `$${fieldName}.${language}`,
          else: `$${fieldName}.${DEFAULT_LANGUAGE}`,
        },
      },
    },
  };
};
