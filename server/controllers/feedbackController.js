const Feedback = require('../models/feedbackModel');

// @desc    Submit feedback (User)
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { subject, message, category, rating, chatId, messageId, messageContent } = req.body;

    // For response feedback (thumbs up/down), rating is required
    if (rating && !['positive', 'negative'].includes(rating)) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    // For negative rating, message is required
    if (rating === 'negative' && !message) {
      return res.status(400).json({ message: 'Please provide details for negative feedback' });
    }

    const feedbackData = {
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      category: category || 'response',
    };

    // Add optional fields if provided
    if (rating) feedbackData.rating = rating;
    if (chatId) feedbackData.chatId = chatId;
    if (messageId) feedbackData.messageId = messageId;
    if (messageContent) feedbackData.messageContent = messageContent;
    if (subject) feedbackData.subject = subject;
    if (message) feedbackData.message = message;

    // Set default subject for response feedback
    if (rating && !subject) {
      feedbackData.subject = rating === 'positive' ? 'Positive Response Feedback' : 'Negative Response Feedback';
    }

    // Set default message for positive feedback
    if (rating === 'positive' && !message) {
      feedbackData.message = 'User found this response helpful';
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// @desc    Get feedback by ID (Admin)
// @route   GET /api/admin/feedback/:id
// @access  Private/Admin
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// @desc    Update feedback status (Admin)
// @route   PUT /api/admin/feedback/:id
// @access  Private/Admin
const updateFeedback = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (adminNotes !== undefined) feedback.adminNotes = adminNotes;

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
};

// @desc    Delete feedback (Admin)
// @route   DELETE /api/admin/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
};

// @desc    Get feedback statistics (Admin)
// @route   GET /api/admin/feedback/stats
// @access  Private/Admin
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments({});
    
    const feedbackByStatus = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const feedbackByCategory = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalFeedback,
        feedbackByStatus,
        feedbackByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback stats', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
};
