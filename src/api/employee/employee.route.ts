import multer from 'multer';
import express from 'express';
import employeeController from './employee.controller';
import { GET_EMPLOYEE_DETAILS, LIST_COMPANIES, SEARCH_EMPLOYEES, UPDATE_EMPLOYEE_PROFILE } from './employee.map';
import {
  ADD_ALBUM,
  ADD_ALBUM_ASSETS,
  GET_ALBUM,
  GET_ALBUMS,
  REMOVE_ALBUM,
  REMOVE_ALBUM_ASSETS,
  UPDATE_ALBUM,
  UPDATE_ASSET,
  UPLOAD_PHOTO,
} from './album/album.map';
import { ADD_REVIEW, GET_REVIEW, GET_REVIEWS, REMOVE_REVIEW, UPDATE_REVIEW } from './review/review.map';
import { optionalAuth, requireAuth } from '../../shared/composables/middleware';

const router = express.Router();
const upload = multer();

router.get(`/${LIST_COMPANIES}`, employeeController[LIST_COMPANIES]);
router.post(`/${SEARCH_EMPLOYEES}`, optionalAuth, employeeController[SEARCH_EMPLOYEES]);
router.get(`/${GET_EMPLOYEE_DETAILS}`, optionalAuth, employeeController[GET_EMPLOYEE_DETAILS]);
router.post(`/${UPDATE_EMPLOYEE_PROFILE}`, requireAuth, employeeController[UPDATE_EMPLOYEE_PROFILE]);

router.post(`/${GET_ALBUMS}`, employeeController[GET_ALBUMS]);
router.post(`/${GET_ALBUM}`, employeeController[GET_ALBUM]);
router.post(`/${ADD_ALBUM}`, requireAuth, employeeController[ADD_ALBUM]);
router.put(`/${UPDATE_ALBUM}`, requireAuth, employeeController[UPDATE_ALBUM]);
router.put(`/${UPDATE_ASSET}`, requireAuth, employeeController[UPDATE_ASSET]);
router.delete(`/${REMOVE_ALBUM}/:id`, requireAuth, employeeController[REMOVE_ALBUM]);
router.post(`/${UPLOAD_PHOTO}/:id`, requireAuth, upload.array('images'), employeeController[UPLOAD_PHOTO]);
router.post(`/${ADD_ALBUM_ASSETS}`, requireAuth, employeeController[ADD_ALBUM_ASSETS]);
router.post(`/${REMOVE_ALBUM_ASSETS}`, requireAuth, employeeController[REMOVE_ALBUM_ASSETS]);

router.post(`/${ADD_REVIEW}`, requireAuth, employeeController[ADD_REVIEW]);
router.post(`/${UPDATE_REVIEW}`, requireAuth, employeeController[ADD_REVIEW]);
router.get(`/${GET_REVIEW}/:id`, employeeController[GET_REVIEW]);
router.post(`/${GET_REVIEWS}`, employeeController[GET_REVIEWS]);
router.delete(`/${REMOVE_REVIEW}/:id`, requireAuth, employeeController[REMOVE_REVIEW]);

export const employeeRoute = router;
