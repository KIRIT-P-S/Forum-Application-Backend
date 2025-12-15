const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.chatWithAI);

router.post('/suggestions', aiController.getSuggestions);

module.exports = router;
