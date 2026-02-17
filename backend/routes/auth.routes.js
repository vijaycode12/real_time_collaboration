import { Router } from "express";

import { signUp,logIn,signOut,getMe } from "../controllers/auth.controller.js";

import {protect} from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post('/sign-up',signUp);
authRouter.post('/log-in',logIn);
authRouter.post('/sign-out',signOut);
authRouter.get('/me',protect,getMe);

export default authRouter;