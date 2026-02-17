import mongoose from "mongoose";
import Task from '../models/task.model.js';
import List from '../models/list.model.js';
import Board from '../models/board.model.js';
import Activity from '../models/activity.model.js';
import User from '../models/user.model.js';
import { populate } from "dotenv";

export const getTasks = async (req, res, next) => {
  try {
    const { boardId, listId } = req.query;
    let query = { board: boardId };
    if (listId) query.list = listId;

    const tasks = await Task.find(query)
      .populate('list', 'title')
      .populate('createdBy', 'username')
      .populate('assignees', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('list', 'title')
      .populate('board', 'title')
      .populate('createdBy', 'username')
      .populate('assignees', 'username');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  let committed = false;
  try {
    await session.startTransaction();
    const { title, description } = req.body;
    const listId = req.params?.listId;
    console.log('EXTRACTED listId:', listId);

    if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: `Invalid list ID: ${listId}` });
    }

    const list = await List.findById(listId).session(session);
    if (!list) return res.status(404).json({ message: 'List not found' });

    let boardId = list.board;
    let board = null;
    if (mongoose.Types.ObjectId.isValid(boardId)) {
      board = await Board.findById(boardId).session(session);
    }

    if (!board) {
      return res.status(400).json({ 
        message: 'Board not found for list',
        listBoard: boardId?.toString()
      });
    }

    const task = await Task.create([{
      title:req.body.title,
      description:req.body.description,
      board: board._id,
      list: list._id,
      position: 0,
      priority: req.body.priority || 'medium',
      createdBy: req.user._id,
      assignees: req.body.assignees || []
    }], { session });

    await Activity.create([{
      board: board._id,
      list: list._id,
      task: task[0]._id,
      user: req.user._id,
      type: 'task_created',
      message: `${req.user.username} created task "${title}"`
    }], { session });

    await session.commitTransaction();
    io.to(board._id.toString()).emit('board_updated', { action: 'task_create', boardId: board._id });
    committed = true;

    const populatedTask = await Task.findById(task[0]._id)
      .populate('createdBy', 'username')
      .populate('assignees', 'username')
      .populate('list', 'title');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    if (!committed) {
    await session.abortTransaction();
  }
    next(error);
  }
  finally{
    await session.endSession();
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const updateFields = {};
    
    // Safe field-by-field updates
    if (req.body.title !== undefined) updateFields.title = req.body.title;
    if (req.body.description !== undefined) updateFields.description = req.body.description;
    if (req.body.priority !== undefined) updateFields.priority = req.body.priority;
    if (req.body.position !== undefined) updateFields.position = req.body.position;
    if (req.body.dueDate !== undefined) updateFields.dueDate = req.body.dueDate;
    if (req.body.assignees !== undefined) updateFields.assignees = req.body.assignees;
    
    // Safe list change
    if (req.body.list) {
      const tempList = await List.findById(req.body.list);
      if (!tempList) return res.status(400).json({ message: 'List not found' });
      updateFields.list = req.body.list;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: false }
    )
    .populate('list', 'title')
    .populate('createdBy', 'username')
    .populate('assignees', 'username');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  let committed = false;
  try {
    await session.startTransaction();

    const task = await Task.findById(req.params.id).session(session);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const boardId = task.board;
    await Task.deleteOne({ _id: req.params.id }).session(session);
    await Activity.create([{
      board: boardId,
      task: req.params.id,
      user: req.user._id,
      type: 'task_deleted',
      message: `${req.user.username} deleted task`
    }], { session });

    await session.commitTransaction();
    io.to(boardId.toString()).emit('board_updated', { action: 'task_delete', boardId: boardId });
    committed = true;

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    if (!committed) await session.abortTransaction();
    next(error);
  }
  finally{
    await session.endSession();
  }
};

export const moveTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  let committed = false;
  try {
    await session.startTransaction();
    
    const task = await Task.findById(req.params.id).session(session);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const { listId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: `Invalid list ID: ${listId}` });
    }
    
    const newList = await List.findById(listId).session(session);
    if (!newList) return res.status(404).json({ message: 'List not found' });
    
    task.list = newList._id;
    await task.save({ session });
    
    await Activity.create([{
      board: newList.board,
      task: task._id,
      list: newList._id,
      user: req.user._id,
      type: 'task_moved',
      message: `${req.user.username} moved task to "${newList.title}"`
    }], { session });
    
    await session.commitTransaction();
    io.to(boardId.toString()).emit('board_updated', { action: 'task_delete', boardId: boardId });
    committed = true;

    res.json({ 
      success: true, 
      message: 'Task moved!',
      taskId: task._id,
      newList: newList.title
    });
  } catch (error) {
    if (!committed) await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getAssignees = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'username email avatar')
      .select('assignees');
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ 
      success: true, 
      data: {
        assignees: task.assignees || [],
        count: (task.assignees || []).length
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const addAssignee = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });


    await Task.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignees: userId } },  // No schema overwrite
      { runValidators: false }
    );

    const populatedTask = await Task.findById(req.params.id)
      .populate('assignees', 'username');
    
    res.json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const removeAssignee = async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignees: req.params.userId } }, 
      { runValidators: false }
    );

    const populatedTask = await Task.findById(req.params.id)
      .populate('assignees', 'username');
    
    res.json({ success: true, message:"Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
