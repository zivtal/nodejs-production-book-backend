import express from 'express';
import { DELETE_MESSAGE, GET_MESSAGES, LIST_CHATS, SEND_MESSAGE, UPDATE_MESSAGE } from './chat.map';
import chatController from './chat.controller';
import { requireAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.post(`/${LIST_CHATS}`, requireAuth, chatController[LIST_CHATS]);
router.post(`/${SEND_MESSAGE}`, requireAuth, chatController[SEND_MESSAGE]);
router.post(`/${DELETE_MESSAGE}`, requireAuth, chatController[DELETE_MESSAGE]);
router.post(`/${UPDATE_MESSAGE}`, requireAuth, chatController[UPDATE_MESSAGE]);
router.post(`/${GET_MESSAGES}`, requireAuth, chatController[GET_MESSAGES]);

export const chatRoutes = router;
