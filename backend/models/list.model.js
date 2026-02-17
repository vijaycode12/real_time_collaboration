import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    board:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    title:{
        type: String,
        required: [true, 'List title required'],
        trim: true, maxLength: 30
    },
    position:{type: Number, required: true, default: 0, min: 0 }
    }, { timestamps: true });


const List = mongoose.model('List',listSchema);
export default List;