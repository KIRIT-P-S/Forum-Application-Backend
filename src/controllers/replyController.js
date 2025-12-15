const Reply = require('../models/Reply');
const Thread = require('../models/Thread');

// @desc    Get replies for a thread
// @route   GET /api/threads/:threadId/replies
// @access  Public
exports.getReplies = async (req, res, next) => {
  try {
    const replies = await Reply.find({ thread: req.params.threadId })
      .populate('author', 'name email avatar reputation')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create reply
// @route   POST /api/threads/:threadId/replies
// @access  Private
exports.createReply = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    if (thread.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Thread is locked'
      });
    }

    const reply = await Reply.create({
      thread: req.params.threadId,
      author: req.user.id,
      content: req.body.content
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate('author', 'name email avatar reputation');

    res.status(201).json({
      success: true,
      data: populatedReply
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reply
// @route   PUT /api/replies/:id
// @access  Private
exports.updateReply = async (req, res, next) => {
  try {
    let reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply'
      });
    }

    reply = await Reply.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reply
// @route   DELETE /api/replies/:id
// @access  Private
exports.deleteReply = async (req, res, next) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    await reply.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike reply
// @route   POST /api/replies/:id/like
// @access  Private
exports.likeReply = async (req, res, next) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const alreadyLiked = reply.likedBy.includes(req.user.id);

    if (alreadyLiked) {
      reply.likedBy = reply.likedBy.filter(id => id.toString() !== req.user.id);
      reply.likes -= 1;
    } else {
      reply.likedBy.push(req.user.id);
      reply.likes += 1;
    }

    await reply.save();

    res.status(200).json({
      success: true,
      data: { likes: reply.likes, liked: !alreadyLiked }
    });
  } catch (error) {
    next(error);
  }
};
