export const isClosed = () => ({ $cond: [{ $lt: ['$filled', '$amount'] }, true, false] });
