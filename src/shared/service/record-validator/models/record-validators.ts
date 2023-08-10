import type { CustomValidator } from './custom-validator';
import type { CoreValidators } from './core-validators';

export type RecordValidators = Partial<CoreValidators & { custom: Array<CustomValidator> }>;
