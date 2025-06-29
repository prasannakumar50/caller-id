const express = require('express');
const { SpamReport, Contact, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateSpamReport } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   POST /api/spam/report
// @desc    Report a phone number as spam
// @access  Private
router.post('/report', validateSpamReport, async (req, res) => {
  try {
    const { phoneNumber, reason, description } = req.body;

    // Check if user already reported this number
    const existingReport = await SpamReport.findOne({
      where: {
        phoneNumber,
        reportedBy: req.user.id
      }
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'You have already reported this phone number'
      });
    }

    // Create spam report
    const spamReport = await SpamReport.create({
      phoneNumber,
      reportedBy: req.user.id,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Spam report submitted successfully',
      data: {
        report: spamReport.toJSON()
      }
    });
  } catch (error) {
    console.error('Report spam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit spam report'
    });
  }
});

// @route   GET /api/spam/stats/:phoneNumber
// @desc    Get spam statistics for a phone number
// @access  Private
router.get('/stats/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Get spam statistics
    const spamStats = await SpamReport.getSpamStats(phoneNumber);

    // Check if current user has reported this number
    const userReport = await SpamReport.findOne({
      where: {
        phoneNumber,
        reportedBy: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        phoneNumber,
        spamStats,
        userReported: !!userReport,
        userReport: userReport ? userReport.toJSON() : null
      }
    });
  } catch (error) {
    console.error('Get spam stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spam statistics'
    });
  }
});

// @route   GET /api/spam/reports
// @desc    Get user's spam reports
// @access  Private
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: reports } = await SpamReport.findAndCountAll({
      where: { reportedBy: req.user.id },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        reports: reports.map(report => report.toJSON()),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spam reports'
    });
  }
});

// @route   DELETE /api/spam/reports/:id
// @desc    Delete user's spam report
// @access  Private
router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await SpamReport.findOne({
      where: {
        id,
        reportedBy: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Spam report not found'
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Spam report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete spam report'
    });
  }
});

// @route   GET /api/spam/check/:phoneNumber
// @desc    Check if a phone number is spam
// @access  Private
router.get('/check/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Get spam likelihood
    const spamLikelihood = await SpamReport.getSpamLikelihood(phoneNumber);

    // Get recent reports (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReports = await SpamReport.findAll({
      where: {
        phoneNumber,
        createdAt: {
          [require('sequelize').Op.gte]: thirtyDaysAgo
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Check if current user has reported this number
    const userReport = await SpamReport.findOne({
      where: {
        phoneNumber,
        reportedBy: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        phoneNumber,
        spamLikelihood,
        isSpam: spamLikelihood >= 75,
        recentReports: recentReports.length,
        userReported: !!userReport,
        riskLevel: getRiskLevel(spamLikelihood)
      }
    });
  } catch (error) {
    console.error('Check spam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check spam status'
    });
  }
});

// Helper function to get risk level
function getRiskLevel(spamLikelihood) {
  if (spamLikelihood === 0) return 'safe';
  if (spamLikelihood <= 25) return 'low';
  if (spamLikelihood <= 50) return 'medium';
  if (spamLikelihood <= 75) return 'high';
  return 'very_high';
}

// @route   GET /api/spam/trending
// @desc    Get trending spam numbers (most reported in last 7 days)
// @access  Private
router.get('/trending', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingSpam = await SpamReport.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        'phoneNumber',
        [require('sequelize').fn('COUNT', require('sequelize').col('phoneNumber')), 'reportCount']
      ],
      group: ['phoneNumber'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('phoneNumber')), 'DESC']],
      limit: 10
    });

    // Get spam likelihood for each number
    const trendingWithLikelihood = await Promise.all(
      trendingSpam.map(async (item) => {
        const spamLikelihood = await SpamReport.getSpamLikelihood(item.phoneNumber);
        return {
          phoneNumber: item.phoneNumber,
          reportCount: parseInt(item.dataValues.reportCount),
          spamLikelihood,
          riskLevel: getRiskLevel(spamLikelihood)
        };
      })
    );

    res.json({
      success: true,
      data: {
        trending: trendingWithLikelihood,
        period: '7_days'
      }
    });
  } catch (error) {
    console.error('Get trending spam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending spam'
    });
  }
});

module.exports = router; 