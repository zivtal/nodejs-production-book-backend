import express from 'express';
import jobController from './job.controller';
import {
  CREATE_CONVERSATION,
  CREATE_JOB_POST,
  DELETE_CONVERSATION_MESSAGE,
  GET_CALENDAR_EVENTS,
  GET_CONVERSATION,
  GET_JOB_DETAILS,
  GET_UPCOMING_EVENTS,
  GET_POSITION_DETAILS,
  LEAVE_CONVERSATION,
  LIST_CLASSIFICATIONS,
  LIST_SKILLS,
  SEARCH_JOB_POSTS,
  SEARCH_POSITIONS,
  SEND_CONVERSATION_MESSAGE,
  UPDATE_CONVERSATION_AGREEMENTS,
  UPDATE_CONVERSATION_MESSAGE,
  UPDATE_CONVERSATION_STATUS,
  UPDATE_JOB_POST,
} from './job.map';
import { optionalAuth, requireAuth } from '../../shared/composables/middleware';

const router = express.Router();

router.post(`/${LIST_SKILLS}`, optionalAuth, jobController[LIST_SKILLS]);
router.get(`/${LIST_CLASSIFICATIONS}`, optionalAuth, jobController[LIST_CLASSIFICATIONS]);
router.post(`/${GET_CALENDAR_EVENTS}`, requireAuth, jobController[GET_CALENDAR_EVENTS]);
router.post(`/${GET_UPCOMING_EVENTS}`, requireAuth, jobController[GET_UPCOMING_EVENTS]);

router.get(`/${GET_JOB_DETAILS}/:id`, requireAuth, jobController[GET_JOB_DETAILS]);
router.post(`/${CREATE_JOB_POST}`, requireAuth, jobController[CREATE_JOB_POST]);
router.post(`/${UPDATE_JOB_POST}`, requireAuth, jobController[UPDATE_JOB_POST]);
router.post(`/${SEARCH_JOB_POSTS}`, requireAuth, jobController[SEARCH_JOB_POSTS]);

router.get(`/${GET_POSITION_DETAILS}/:id`, optionalAuth, jobController[GET_POSITION_DETAILS]);
router.post(`/${SEARCH_POSITIONS}`, optionalAuth, jobController[SEARCH_POSITIONS]);

router.get(`/${GET_CONVERSATION}/:id`, requireAuth, jobController[GET_CONVERSATION]);
router.get(`/${LEAVE_CONVERSATION}/:id`, requireAuth, jobController[LEAVE_CONVERSATION]);
router.post(`/${CREATE_CONVERSATION}`, requireAuth, jobController[CREATE_CONVERSATION]);
router.post(`/${UPDATE_CONVERSATION_STATUS}`, requireAuth, jobController[UPDATE_CONVERSATION_STATUS]);
router.post(`/${SEND_CONVERSATION_MESSAGE}`, requireAuth, jobController[SEND_CONVERSATION_MESSAGE]);
router.post(`/${UPDATE_CONVERSATION_MESSAGE}`, requireAuth, jobController[UPDATE_CONVERSATION_MESSAGE]);
router.delete(`/${DELETE_CONVERSATION_MESSAGE}`, requireAuth, jobController[DELETE_CONVERSATION_MESSAGE]);
router.post(`/${UPDATE_CONVERSATION_AGREEMENTS}/:conversationId`, requireAuth, jobController[UPDATE_CONVERSATION_AGREEMENTS]);

export const jobRoute = router;
