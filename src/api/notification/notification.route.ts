import express from 'express';
import { GET_NOTIFICATIONS, REMOVE_NOTIFICATION, SAVE_TOKEN } from './notification.maps';
import notificationController from './notification.controller';
import { requireAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.post(`/${SAVE_TOKEN}`, requireAuth, notificationController[SAVE_TOKEN]);
router.post(`/${GET_NOTIFICATIONS}`, requireAuth, notificationController[GET_NOTIFICATIONS]);
router.delete(`/${REMOVE_NOTIFICATION}/:id`, requireAuth, notificationController[REMOVE_NOTIFICATION]);

export const notificationRoutes = router;
