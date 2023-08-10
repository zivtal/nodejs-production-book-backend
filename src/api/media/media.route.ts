import express from 'express';
import { GET_VIDEO_DETAILS } from './media.maps';
import mediaController from './media.controller';

const router = express.Router();

router.post(`/${GET_VIDEO_DETAILS}`, mediaController[GET_VIDEO_DETAILS]);

export const mediaRoutes = router;
