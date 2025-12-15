const express = require('express');
const router = express.Router();
const {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  likeThread
} = require('../controllers/threadController');
const { protect } = require('../middleware/auth');

// Import reply routes
const replyRouter = require('./replies');

// Re-route into reply router
router.use('/:threadId/replies', replyRouter);

router.route('/')
  .get(getThreads)
  .post(protect, createThread);

router.route('/:id')
  .get(getThread)
  .put(protect, updateThread)
  .delete(protect, deleteThread);

router.post('/:id/like', protect, likeThread);

module.exports = router;
