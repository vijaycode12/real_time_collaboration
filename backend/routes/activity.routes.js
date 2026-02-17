import { Router } from "express";

import { getActivities } from "../controllers/activity.controller.js";

import {protect} from '../middlewares/auth.middleware.js';

const activityRouter = Router();

activityRouter.get('/boards/:boardId/activity',protect,getActivities);

export default activityRouter;