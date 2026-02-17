//import mongoose from "mongoose";
import Task from '../models/task.model.js';
import Board from '../models/board.model.js';
// import List from '../models/list.model.js';
// import User from '../models/user.model.js';

export const search = async (req, res, next) => {
  try {
    const { q, type = 'all', boardId } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const searchTerm = q.trim().toLowerCase();
    let query = {};
    let results = [];

    if (type === 'all' || type === 'task') {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
      if (boardId) query.board = boardId;
      
      const tasks = await Task.find(query)
        .populate('board', 'name')
        .populate('list', 'title')
        .populate('createdBy', 'username')
        .limit(10);
      results.push(...tasks);
    }

    if (type === 'all' || type === 'board') {
      const boards = await Board.find({
        name: { $regex: searchTerm, $options: 'i' },
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).populate('owner', 'username').limit(5);
      results.push(...boards);
    }

    res.json({ 
      success: true, 
      data: results,
      count: results.length 
    });
  } catch (error) {
    next(error);
  }
};
