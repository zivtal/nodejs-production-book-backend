export const sumOfArray = (fieldName: string, inputArray: string, cond: Record<string, any>): Record<string, any> => ({
  [fieldName]: {
    $size: {
      $filter: {
        input: `$${inputArray}`,
        cond,
      },
    },
  },
});
