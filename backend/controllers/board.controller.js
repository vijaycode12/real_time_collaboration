import Board from '../models/board.model.js';
import Activity from '../models/activity.model.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user._id })
      .populate('owner', 'username')
      .populate('members.user', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBoard = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    await session.startTransaction();

    const board = await Board.create([{
      ...req.body,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }]
    }], { session });

    await Activity.create([{
      board: board[0]._id,
      user: req.user._id,
      type: 'board_created'
    }], { session });

    await session.commitTransaction();
    committed = true;

    global.io.to('global').emit('board_updated', {
      action: 'create',
      boardId: board[0]._id
    });

    const populatedBoard = await Board.findById(board[0]._id)
      .populate('owner', 'username')
      .populate('members.user', 'username email');

    res.status(201).json({ success: true, data: populatedBoard });

  } catch (err) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const getBoard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board ID' });
    }

    const board = await Board.findById(req.params.id)
      .populate('owner', 'username')
      .populate('members.user', 'username email');

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const isOwner = board.owner._id.toString() === req.user._id.toString();
    const isMember = board.members.some(m => m.user._id.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBoard = async (req, res) => { 
  const session = await mongoose.startSession();
  let committed = false;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board ID' });
    }

    await session.startTransaction();

    const board = await Board.findById(req.params.id).session(session);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Board not found or not authorized' });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      { 
        name: req.body.name,
        description: req.body.description || board.description,
        $setOnInsert: { owner: board.owner, members: board.members }
      },
      { 
        new: true, 
        runValidators: true, 
        session,
        overwrite: true
      }
    ).populate('owner', 'username')
     .populate('members.user', 'username email');

    await Activity.create([{
      board: updatedBoard._id,
      user: req.user._id,
      type: 'task_updated',
      meta: req.body
    }], { session });

    await session.commitTransaction();
    io.to(req.params.id).emit('board_updated', { action: 'update', boardId: req.params.id });
    committed = true;

    res.json({ success: true, data: updatedBoard });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const deleteBoard = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board ID' });
    }

    await session.startTransaction();

    const board = await Board.findById(req.params.id).session(session);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Board.findByIdAndDelete(req.params.id, { session });
    await Activity.create([{
      board: req.params.id,
      user: req.user._id,
      type: 'board_deleted'
    }], { session });

    await session.commitTransaction();
     io.to(req.params.id).emit('board_updated', { action: 'delete', boardId: req.params.id });
    committed = true;

    res.json({ success: true, message: 'Board deleted successfully' });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const getMembers = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid board ID' });
    }

    const board = await Board.findById(req.params.id)
      .populate('members.user', 'username email');

    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: board.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMember = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    const { userId, role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    await session.startTransaction();

    const board = await Board.findById(req.params.id).session(session);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existingMember = board.members.find(m => m.user.toString() === userId);
    if (existingMember) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Member already exists' });
    }

    board.members.push({ user: userId, role });
    await board.save({ session });

    await Activity.create([{
      board: board._id,
      user: req.user._id,
      type: 'member_added',
      meta: { userId, role }
    }], { session });

    await session.commitTransaction();
    committed = true;

    const populatedBoard = await Board.findById(board._id)
    .lean()
      .populate('members.user', 'username email');

    res.status(201).json({ success: true, data: populatedBoard.members });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const updateMember = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    const { role } = req.body;
    const { id: boardId, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    await session.startTransaction();

    const board = await Board.findById(boardId).session(session);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const memberIndex = board.members.findIndex(m => m._id.toString() === memberId);
    if (memberIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    board.members[memberIndex].role = role;
    await board.save({ session });

    await Activity.create([{
      board: board._id,
      user: req.user._id,
      type: 'member_updated',
      meta: { memberId, role }
    }], { session });

    await session.commitTransaction();
    committed = true;

    const populatedBoard = await Board.findById(boardId)
    .lean()
      .populate('members.user', 'username email');

    const updatedMember = populatedBoard.members.find(m => m._id.toString() === memberId);

    res.json({ success: true, data: updatedMember });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const removeMember = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    const { id: boardId, memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs' });
    }

    await session.startTransaction();

    const board = await Board.findById(boardId).session(session);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const memberIndex = board.members.findIndex(m => m._id.toString() === memberId);
    if (memberIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (board.members[memberIndex].role === 'owner') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Cannot remove owner' });
    }

    board.members.splice(memberIndex, 1);
    await board.save({ session });

    await Activity.create([{
      board: board._id,
      user: req.user._id,
      type: 'member_removed',
      meta: { memberId }
    }], { session });

    await session.commitTransaction();
    committed = true;

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    if (!committed && session.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};
