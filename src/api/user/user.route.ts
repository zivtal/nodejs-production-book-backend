import express from 'express';
import userController from './user.controller';
import { ADD_USER, GET_USER, GET_USERS, REMOVE_USER, UPDATE_USER } from './user.map';
import { requireAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.get(`/${GET_USERS}`, userController[GET_USERS]);
router.get(`/${GET_USER}/:id`, userController[GET_USER]);
router.post(`/${ADD_USER}`, userController[ADD_USER]);
router.put(`/${UPDATE_USER}/:id`, requireAuth, userController[UPDATE_USER]);
router.delete(`/${REMOVE_USER}/:id`, requireAuth, userController[REMOVE_USER]);

export const userRoutes = router;
