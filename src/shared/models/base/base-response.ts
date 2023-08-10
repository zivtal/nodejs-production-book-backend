export type BaseResponse<T = Record<never, never>> = { returnCode: number } & T;
