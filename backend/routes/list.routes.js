import { Router } from "express";

import { getLists,createList,updateList,deleteList } from "../controllers/list.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const listRouter = Router();

listRouter.get('/boards/:boardId/lists',protect,getLists);
listRouter.post('/boards/:boardId/lists',protect,createList);
listRouter.put('/lists/:id',protect,updateList);
listRouter.delete('/lists/:id',protect,deleteList);

export default listRouter;