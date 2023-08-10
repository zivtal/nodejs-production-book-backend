import type { Response } from 'express';
import type { BaseRequest, BaseOptionsResponse } from '../../shared/models';
import type {
  GetEquipmentSpecsReq,
  GetEquipmentSpecsRes,
  ListCamerasRes,
  ListDronesRes,
  ListGimbalsRes,
  ListLensesReq,
  ListLensesRes,
} from './models';
import equipmentService from './equipment.service';
import { LIST_EQUIPMENTS, LIST_CAMERAS, LIST_DRONES, LIST_GIMBALS, LIST_LENSES, GET_EQUIPMENT_SPECS } from './equipment.map';
import { ListEquipmentsReq } from './models/list-equipments-req';
import RecordValidator, { mongoIdValidator } from '../../shared/service/record-validator';
import { EquipmentTypeEnum } from './constants/equipment-type.enum';

const equipmentController = {
  [LIST_CAMERAS]: async (req: BaseRequest, res: Response<ListCamerasRes>): Promise<void> => {
    const camerasOptions = await equipmentService[LIST_CAMERAS]();

    res.send(camerasOptions);
  },

  [LIST_LENSES]: async (req: BaseRequest<ListLensesReq>, res: Response<ListLensesRes>): Promise<void> => {
    const lensesOptions = await equipmentService[LIST_LENSES](req.body);

    res.send(lensesOptions);
  },

  [LIST_DRONES]: async (req: BaseRequest, res: Response<ListDronesRes>): Promise<void> => {
    const dronesOptions = await equipmentService[LIST_DRONES]();

    res.send(dronesOptions);
  },

  [LIST_GIMBALS]: async (req: BaseRequest, res: Response<ListGimbalsRes>): Promise<void> => {
    const gimbalsOptions = await equipmentService[LIST_GIMBALS]();

    res.send(gimbalsOptions);
  },

  [LIST_EQUIPMENTS]: async <Res>(req: BaseRequest<ListEquipmentsReq>, res: Response<BaseOptionsResponse<Res>>): Promise<void> => {
    const validator = new RecordValidator(req.body, [['type', { equal: [Object.keys(EquipmentTypeEnum)] }]], {
      type: 1,
    });

    const specs = await equipmentService[LIST_EQUIPMENTS](validator.results);

    res.send(specs);
  },

  [GET_EQUIPMENT_SPECS]: async (req: BaseRequest<GetEquipmentSpecsReq>, res: Response<GetEquipmentSpecsRes>): Promise<void> => {
    const validator = new RecordValidator(req.body, [['equipmentId', { required: [true], custom: [mongoIdValidator] }]], { equipmentId: 1 });
    const specs = await equipmentService[GET_EQUIPMENT_SPECS](validator.results.equipmentId);

    res.send(specs);
  },
};

export default equipmentController;
