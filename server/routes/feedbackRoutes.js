const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// User can submit feedback
router.post('/', protect, submitFeedback);

module.exports = router;
