import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
    },
    list:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Task title required'],
        trim: true
    },
    description:{
        type: String,
        trim: true,
        maxLength: 1000
    },
    position:{
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
    dueDate:{
        type: Date
    },
    assignees:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    }, { timestamps: true });


const Task = mongoose.model('Task',taskSchema);
export default Task;