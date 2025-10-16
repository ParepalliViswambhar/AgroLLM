const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  getAnalytics,
  timeoutUser,
  blockUser,
  unblockUser,
} = require('../controllers/adminController');
const {
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
} = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// User moderation
router.post('/users/:id/timeout', timeoutUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// Feedback management
router.get('/feedback/stats', getFeedbackStats);
router.get('/feedback', getAllFeedback);
router.get('/feedback/:id', getFeedbackById);
router.put('/feedback/:id', updateFeedback);
router.delete('/feedback/:id', deleteFeedback);

module.exports = router;
