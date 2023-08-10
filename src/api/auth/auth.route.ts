import express from 'express';
import { EMAIL_VALIDATE, SIGN_OUT, SIGN_IN, SIGN_UP, AUTH_CHECK, FORGOT_PASSWORD, CHANGE_PASSWORD, IMPERSONATE_TO } from './auth.map';
import authController from './auth.controller';
import { optionalAuth, requireAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.post(`/${SIGN_IN}`, authController[SIGN_IN]);
router.post(`/${SIGN_UP}`, authController[SIGN_UP]);
router.post(`/${SIGN_OUT}`, requireAuth, authController[SIGN_OUT]);
router.post(`/${EMAIL_VALIDATE}`, authController[EMAIL_VALIDATE]);
router.post(`/${FORGOT_PASSWORD}`, authController[FORGOT_PASSWORD]);
router.post(`/${CHANGE_PASSWORD}`, optionalAuth, authController[CHANGE_PASSWORD]);
router.post(`/${IMPERSONATE_TO}/:id?`, requireAuth, authController[IMPERSONATE_TO]);
router.get(`/${AUTH_CHECK}`, optionalAuth, authController[AUTH_CHECK]);

export const authRoutes = router;
