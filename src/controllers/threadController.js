const Thread = require('../models/Thread');
const Reply = require('../models/Reply');

// @desc    Get all threads
// @route   GET /api/threads
// @access  Public
exports.getThreads = async (req, res, next) => {
  try {
    const { filter, category, search, page = 1, limit = 20 } = req.query;

    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOptions = {};
    switch (filter) {
      case 'popular':
        sortOptions = { likes: -1 };
        break;
      case 'trending':
        sortOptions = { views: -1 };
        break;
      case 'unanswered':
        query.replyCount = 0;
        sortOptions = { createdAt: -1 };
        break;
      default: // recent
        sortOptions = { createdAt: -1 };
    }

    const threads = await Thread.find(query)
      .populate('author', 'name email avatar')
      .populate('replyCount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Thread.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Math.ceil(count / limit)
      },
      data: threads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single thread
// @route   GET /api/threads/:id
// @access  Public
exports.getThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'name email avatar reputation');

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Increment views
    thread.views += 1;
    await thread.save();

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create thread
// @route   POST /api/threads
// @access  Private
exports.createThread = async (req, res, next) => {
  try {
    req.body.author = req.user.id;

    const thread = await Thread.create(req.body);

    const populatedThread = await Thread.findById(thread._id)
      .populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedThread
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update thread
// @route   PUT /api/threads/:id
// @access  Private
exports.updateThread = async (req, res, next) => {
  try {
    let thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check ownership
    if (thread.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this thread'
      });
    }

    thread = await Thread.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete thread
// @route   DELETE /api/threads/:id
// @access  Private
exports.deleteThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check ownership
    if (thread.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this thread'
      });
    }

    await thread.deleteOne();

    // Delete all replies
    await Reply.deleteMany({ thread: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike thread
// @route   POST /api/threads/:id/like
// @access  Private
exports.likeThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const alreadyLiked = thread.likedBy.includes(req.user.id);

    if (alreadyLiked) {
      thread.likedBy = thread.likedBy.filter(id => id.toString() !== req.user.id);
      thread.likes -= 1;
    } else {
      thread.likedBy.push(req.user.id);
      thread.likes += 1;
    }

    await thread.save();

    res.status(200).json({
      success: true,
      data: { likes: thread.likes, liked: !alreadyLiked }
    });
  } catch (error) {
    next(error);
  }
};
