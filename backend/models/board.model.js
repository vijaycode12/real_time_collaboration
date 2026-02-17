import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Board name required'],
        trim: true, maxLength: 50 
    },
    description:{
        type: String,
        trim: true,
        maxLength: 500
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members:[{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer','admin','writer'], default: 'editor' }
    }]
}, { timestamps: true });

const Board = mongoose.model('Board',boardSchema);
export default Board;