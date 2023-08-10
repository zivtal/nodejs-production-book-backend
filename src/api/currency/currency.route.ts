import express from 'express';
import { GET_EXCHANGE_RATE, GET_EXCHANGE_RATES } from './currency.maps';
import currencyController from './currency.controller';
import { optionalAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.get(`/${GET_EXCHANGE_RATES}`, currencyController[GET_EXCHANGE_RATES]);
router.post(`/${GET_EXCHANGE_RATE}`, optionalAuth, currencyController[GET_EXCHANGE_RATE]);

export const currencyRoutes = router;
