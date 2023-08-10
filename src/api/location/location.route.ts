import express from 'express';
import { LIST_ADDRESSES } from './location.maps';
import locationController from './location.controller';
import { optionalAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.get(`/${LIST_ADDRESSES}`, optionalAuth, locationController[LIST_ADDRESSES]);

export const locationRoutes = router;
