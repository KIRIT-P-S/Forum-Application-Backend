const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getReplies,
  createReply,
  updateReply,
  deleteReply,
  likeReply
} = require('../controllers/replyController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getReplies)
  .post(protect, createReply);

router.route('/:id')
  .put(protect, updateReply)
  .delete(protect, deleteReply);

router.post('/:id/like', protect, likeReply);

module.exports = router;
