import type { BaseDate } from '../../../../shared/models';

export interface ConversationAgreement {
  amount: number;
  currencyType: string;
  includeTax?: boolean;
  updatedAt?: BaseDate;
}
