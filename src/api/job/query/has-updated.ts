export const hasUpdated = (userId: string) => ({ $cond: [{ $lt: [`$lastSeenAt.${userId}`, '$updatedAt'] }, true, false] });
