import type { ConversationAgreement } from './conversation-agreement';
import type { BaseId } from '../../../../shared/models';

export interface CreateConversationReq {
  positionId: BaseId;
  amount: ConversationAgreement['amount'];
  currencyType: ConversationAgreement['currencyType'];
  includeTax?: ConversationAgreement['includeTax'];
}
