import { Router } from "express";

import { search } from "../controllers/search.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const searchRouter = Router();

searchRouter.get('/',protect,search);

export default searchRouter;