import express from 'express';
import equipmentController from './equipment.controller';
import { GET_EQUIPMENT_SPECS, LIST_CAMERAS, LIST_DRONES, LIST_EQUIPMENTS, LIST_GIMBALS, LIST_LENSES } from './equipment.map';

const router = express.Router();

router.post(`/${LIST_CAMERAS}`, equipmentController[LIST_CAMERAS]);
router.post(`/${LIST_LENSES}`, equipmentController[LIST_LENSES]);
router.post(`/${LIST_DRONES}`, equipmentController[LIST_DRONES]);
router.post(`/${LIST_GIMBALS}`, equipmentController[LIST_GIMBALS]);
router.post(`/${LIST_EQUIPMENTS}`, equipmentController[LIST_EQUIPMENTS]);
router.post(`/${GET_EQUIPMENT_SPECS}`, equipmentController[GET_EQUIPMENT_SPECS]);

export const equipmentRoute = router;
