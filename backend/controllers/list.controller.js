import mongoose from 'mongoose';
import List from '../models/list.model.js';
import Activity from '../models/activity.model.js';

export const getLists = async(req,res,next)=>{
    try {

    //   const board = await Board.findById(req.params.boardId);
    // if (!board || board.owner.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: 'Not authorized' });
    // }

    const lists = await List.find({ board: req.params.boardId })
      .sort('position')
      .populate('board', 'name');
    res.json({ success: true, data: lists });
  } catch (error) {
    next(error);
  }
}

export const createList = async (req, res, next) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    await session.startTransaction();

    const list = await List.create([{
      title: req.body.title,
      board: req.params.boardId,
      position: req.body.position || 1
    }], { session });

    await Activity.create([{
      board: req.params.boardId,
      user: req.user._id,
      type: 'list_created'
    }], { session });

    await session.commitTransaction();
    committed = true;

    global.io.to(req.params.boardId).emit('board_updated', {
      action: 'list_create',
      boardId: req.params.boardId
    });

    const populatedList = await List.findById(list[0]._id)
      .populate('board', 'name');

    res.status(201).json({ success: true, data: populatedList });

  } catch (err) {
    if (!committed) await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};


export const updateList = async(req,res,next, io)=>{
  const session = await mongoose.startSession();
  let committed = false;
    try {
      await session.startTransaction();

    const list = await List.findByIdAndUpdate(
      req.params.id,
      { title:req.body.ttle,position:req.body.position },
      { new: true, runValidators: true ,session}
    ).populate('board', 'name').lean();
    
    if (!list) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    await Activity.create([{
      board: list.board,
      user: req.user._id,
      type: 'list_updated',
      meta: req.body
    }],{session});

    await session.commitTransaction();
     io.to(list.board._id.toString()).emit('board_updated', { action: 'list_update', boardId: list.board._id });
    committed=true;
    
    
    res.json({ success: true, data: list });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(console.error);
    }
    next(error);
  }
  finally{
    await session.endSession();
  }
}

export const deleteList = async(req,res,next)=>{
   const session = await mongoose.startSession();
    let committed = false;
    try {
      await session.startTransaction();;
   const list = await List.findById(req.params.id).session(session);
    if (!list){ 
      await session.abortTransaction();
      return res.status(404).json({ message: 'List not found' });
    }

    // const board = await Board.findById(list.board).session(session);
    // if (!board || board.owner.toString() !== req.user._id.toString()) {
    //   await session.abortTransaction();
    //   return res.status(403).json({ success: false, message: 'Not authorized' });
    // }


    await List.findByIdAndDelete(req.params.id, { session });
    
    await Activity.create([{
      board: list.board,
      user: req.user._id,
      type: 'list_deleted'
    }], { session });

    await session.commitTransaction();
    io.to(list.board._id.toString()).emit('board_updated', { action: 'list_delete', boardId: list.board._id });
    committed = true;

    res.json({ success: true, message: 'List deleted' });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(console.error);
    }
    next(error);
  }
  finally{
    await session.endSession();
  }
}