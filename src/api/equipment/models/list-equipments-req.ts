import { EquipmentTypeEnum } from '../constants/equipment-type.enum';

export interface ListEquipmentsReq {
  type: keyof typeof EquipmentTypeEnum.GIMBAL;
}
