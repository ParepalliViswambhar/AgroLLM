const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Feedback = require('../models/feedbackModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        googleId: user.googleId,
        expertAnalysisCount: user.expertAnalysisCount,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        timeoutUntil: user.timeoutUntil,
        timeoutReason: user.timeoutReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's chat count
    const chatCount = await Chat.countDocuments({ userId: user._id });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        googleId: user.googleId,
        expertAnalysisCount: user.expertAnalysisCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        chatCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Optionally delete user's chats
    await Chat.deleteMany({ userId: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalChats = await Chat.countDocuments({});
    const totalFeedback = await Feedback.countDocuments({});
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChats,
        totalFeedback,
        usersByRole,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // 'weekly' or 'monthly'
    
    const now = new Date();
    const chatActivity = [];

    if (period === 'weekly') {
      // Get last 7 weeks (Sunday to Sunday)
      for (let i = 6; i >= 0; i--) {
        const endDate = new Date(now);
        // Go back i weeks
        endDate.setDate(endDate.getDate() - (i * 7));
        // Set to the next Sunday (or today if it's Sunday)
        const dayOfWeek = endDate.getDay();
        endDate.setDate(endDate.getDate() + (7 - dayOfWeek) % 7);
        endDate.setHours(23, 59, 59, 999);
        
        // Start date is the previous Sunday
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        const count = await Chat.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        });
        
        chatActivity.push({
          period: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          count,
          startDate,
          endDate
        });
      }
    } else {
      // Get last 7 months (1st to last day of month)
      for (let i = 6; i >= 0; i--) {
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        startDate.setHours(0, 0, 0, 0);
        
        const count = await Chat.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        });
        
        chatActivity.push({
          period: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count,
          startDate,
          endDate
        });
      }
    }

    // Language usage stats - fixed to handle null/undefined values properly
    const languageStats = await Chat.aggregate([
      {
        $group: { 
          _id: { 
            $ifNull: ['$language', 'en'] 
          }, 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          language: '$_id',
          count: 1
        }
      }
    ]);

    // Response satisfaction from feedback
    const satisfactionStats = await Feedback.aggregate([
      {
        $match: { rating: { $exists: true } }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRatings = satisfactionStats.reduce((sum, stat) => sum + stat.count, 0);
    const positiveRatings = satisfactionStats.find(s => s._id === 'positive')?.count || 0;
    const satisfactionRate = totalRatings > 0 ? ((positiveRatings / totalRatings) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      analytics: {
        languageStats,
        satisfaction: {
          rate: satisfactionRate,
          positive: positiveRatings,
          negative: satisfactionStats.find(s => s._id === 'negative')?.count || 0,
          total: totalRatings
        },
        chatActivity
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
// @desc    Timeout user for 24 hours
// @route   POST /api/admin/users/:id/timeout
// @access  Private/Admin
const timeoutUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot timeout admin users' });
    }

    const timeoutUntil = new Date();
    timeoutUntil.setHours(timeoutUntil.getHours() + 24);

    user.timeoutUntil = timeoutUntil;
    user.timeoutReason = reason || 'Violated community guidelines';
    await user.save();

    res.json({
      success: true,
      message: 'User timed out for 24 hours',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        timeoutUntil: user.timeoutUntil,
        timeoutReason: user.timeoutReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error timing out user', error: error.message });
  }
};

// @desc    Block user permanently
// @route   POST /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block admin users' });
    }

    user.isBlocked = true;
    user.blockedReason = reason || 'Violated terms of service';
    await user.save();

    res.json({
      success: true,
      message: 'User blocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

// @desc    Unblock user
// @route   POST /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    user.blockedReason = '';
    user.timeoutUntil = null;
    user.timeoutReason = '';
    await user.save();

    res.json({
      success: true,
      message: 'User unblocked successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  getAnalytics,
  timeoutUser,
  blockUser,
  unblockUser,
};
