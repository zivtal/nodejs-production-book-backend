import type { BaseItem, BaseOptionsResponse } from '../../shared/models';
import type {
  CameraSpecs,
  DroneSpecs,
  DocumentEquipment,
  GetEquipmentSpecsRes,
  LensSpecs,
  ListCamerasRes,
  ListDronesRes,
  ListGimbalsRes,
  ListLensesReq,
  ListLensesRes,
  Specs,
  GimbalSpecs,
} from './models';
import { GET_EQUIPMENT_SPECS, LIST_CAMERAS, LIST_DRONES, LIST_EQUIPMENTS, LIST_GIMBALS, LIST_LENSES } from './equipment.map';
import { DbCollection } from '../../shared/service/mongodb/constants';
import RecordValidator from '../../shared/service/record-validator';
import { LIST_LENSES_SCHEME } from './constants/list-lenses-scheme';
import { EquipmentTypeEnum } from './constants/equipment-type.enum';
import { ListEquipmentsReq } from './models/list-equipments-req';
import { $match, $project, $toObjectId } from '../../shared/service/mongodb/helpers';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';

const equipmentService: Record<string, (...arg: any) => Promise<any>> = {
  [LIST_CAMERAS]: async (): Promise<ListCamerasRes> => {
    const filters = {};

    const cameras = await mongoDbService.findAll<DocumentEquipment, BaseItem<Specs<CameraSpecs>>>(DbCollection.EQUIPMENTS, [
      $match({ $or: [{ 'specs.type': EquipmentTypeEnum.CAMERA }, { 'specs.type': EquipmentTypeEnum.CAMCORDER }], ...filters }),
      $project({ _id: 0, title: 1, value: '$_id' }),
    ]);

    return { returnCode: cameras.length ? 0 : 1, options: cameras };
  },

  [LIST_LENSES]: async (payload: ListLensesReq): Promise<ListLensesRes> => {
    const validator = new RecordValidator<ListLensesReq>(payload, [], LIST_LENSES_SCHEME, { skipUndefined: true });
    const { value, brand, tStop, maximumAperture, minimumAperture, lensMount, minFocusDistance, hasStabilization } = validator.results;

    const filters = {
      ...(value ? { 'specs.model': { $regex: value, $options: 'i' } } : {}),
      ...(brand ? { 'specs.brand': brand } : {}),
      ...(tStop ? { 'specs.tStop': tStop } : {}),
      ...(maximumAperture ? { 'specs.maximumAperture': maximumAperture } : {}),
      ...(minimumAperture ? { 'specs.minimumAperture': minimumAperture } : {}),
      ...(minimumAperture ? { 'specs.minimumAperture': minimumAperture } : {}),
      ...(minFocusDistance ? { 'specs.minFocusDistance': minFocusDistance } : {}),
      ...(hasStabilization ? { 'specs.hasStabilization': hasStabilization } : {}),
      ...(lensMount?.length ? { 'specs.lensMount': lensMount } : {}),
    };

    const lenses = await mongoDbService.findAll<DocumentEquipment, BaseItem<Specs<LensSpecs>>>(DbCollection.EQUIPMENTS, [
      $match({ 'specs.type': EquipmentTypeEnum.LENS, ...filters }),
      $project({ _id: 0, title: 1, value: '$_id' }),
    ]);

    return { returnCode: lenses.length ? 0 : 1, options: lenses };
  },

  [LIST_DRONES]: async (): Promise<ListDronesRes> => {
    const filters = {};

    const drones = await mongoDbService.findAll<DocumentEquipment, BaseItem<Specs<DroneSpecs>>>(DbCollection.EQUIPMENTS, [
      $match({ 'specs.type': EquipmentTypeEnum.DRONE, ...filters }),
      $project({ _id: 0, title: 1, value: '$_id' }),
    ]);

    return { returnCode: drones.length ? 0 : 1, options: drones };
  },

  [LIST_GIMBALS]: async (): Promise<ListGimbalsRes> => {
    const filters = {};

    const gimbals = await mongoDbService.findAll<DocumentEquipment, BaseItem<Specs<GimbalSpecs>>>(DbCollection.EQUIPMENTS, [
      $match({ 'specs.type': EquipmentTypeEnum.GIMBAL, ...filters }),
      $project({ _id: 0, title: 1, value: '$_id' }),
    ]);

    return { returnCode: gimbals.length ? 0 : 1, options: gimbals };
  },

  [LIST_EQUIPMENTS]: async (payload: ListEquipmentsReq): Promise<BaseOptionsResponse> => {
    const types = await mongoDbService.findAll<DocumentEquipment, BaseItem<string>>(DbCollection.EQUIPMENTS, [
      $match(payload.type ? { 'specs.type': payload.type } : {}),
      $project({ _id: 0, title: 1, value: '$_id' }),
    ]);

    return {
      returnCode: 0,
      options: types,
    };
  },

  [GET_EQUIPMENT_SPECS]: async (id: string): Promise<GetEquipmentSpecsRes> => {
    const { specs } = await mongoDbService.fineOne<DocumentEquipment>(DbCollection.EQUIPMENTS, [$match({ _id: $toObjectId(id) })]);

    return { ...(specs || {}), returnCode: specs ? 0 : 1 };
  },
};

export default equipmentService;
