import mongoose from "mongoose";
import Activity from '../models/activity.model.js';
import Task from '../models/task.model.js';
import List from '../models/list.model.js';

export const getActivities = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ board: boardId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const total = await Activity.countDocuments({ board: boardId });

    res.json({ 
      success: true, 
      data: activities,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
