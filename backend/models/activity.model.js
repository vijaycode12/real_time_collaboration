import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    board:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
    task:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type:{ 
    type: String, 
    required: true, 
    enum: ['board_created', 'list_created','list_updated','assignee_added','assignee_removed','list_deleted','task_deleted', 'task_created', 'task_moved', 'task_updated', 'member_added','board_deleted','member_updated'] 
    },
    meta:{ 
    type: mongoose.Schema.Types.Mixed
    }
    }, { timestamps: true });


const Activity = mongoose.model('Activity',activitySchema);
export default Activity;