const express = require('express');
const router = express.Router();
const { signup, login, getMe, validateToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/validate', protect, validateToken);

module.exports = router;
