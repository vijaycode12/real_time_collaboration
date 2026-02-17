import { Router } from "express";

import { getBoards,createBoard,getBoard,updateBoard,deleteBoard,getMembers,addMember,updateMember,removeMember } from "../controllers/board.controller.js";

import {protect} from '../middlewares/auth.middleware.js';

const boardRouter = Router();

boardRouter.get('/',protect,getBoards);
boardRouter.post('/',protect,createBoard);
boardRouter.get('/:id',protect,getBoard);
boardRouter.put('/:id',protect,updateBoard);
boardRouter.delete('/:id',protect,deleteBoard);
boardRouter.get('/:id/members',protect,getMembers);
boardRouter.post('/:id/members',protect,addMember);
boardRouter.put('/:id/members/:memberId',protect,updateMember);
boardRouter.delete('/:id/members/:memberId',protect,removeMember);

export default boardRouter;
