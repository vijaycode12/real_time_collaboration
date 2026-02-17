import { Router } from "express";

import { getTasks,createTask,getTask,updateTask,deleteTask,moveTask,getAssignees,addAssignee,removeAssignee } from "../controllers/task.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const taskRouter = Router({ mergeParams: true });

taskRouter.get('/lists/:listId/tasks',protect,getTasks);
taskRouter.post('/lists/:listId/tasks',protect,createTask);
taskRouter.get('/tasks/:id',protect,getTask);
taskRouter.put('/tasks/:id',protect,updateTask);
taskRouter.delete('/tasks/:id',protect,deleteTask);
taskRouter.post('/tasks/:id/move',protect,moveTask);
taskRouter.get('/tasks/:id/assignees',protect,getAssignees);
taskRouter.post('/tasks/:id/assignees',protect,addAssignee);
taskRouter.delete('/tasks/:id/assignees/:userId',protect,removeAssignee);

export default taskRouter;