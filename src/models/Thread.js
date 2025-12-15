const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['General Discussion', 'Technical Support', 'Feature Requests', 'Announcements']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['open', 'solved', 'closed'],
    default: 'open'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

threadSchema.virtual('replyCount', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'thread',
  count: true
});

threadSchema.index({ author: 1, createdAt: -1 });
threadSchema.index({ category: 1, createdAt: -1 });
threadSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Thread', threadSchema);
