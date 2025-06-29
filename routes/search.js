const express = require('express');
const { Op } = require('sequelize');
const { User, Contact, SpamReport } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateSearch } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/search
// @desc    Search for people by name or phone number
// @access  Private
router.get('/', validateSearch, async (req, res) => {
  try {
    const { q, type = 'name', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let results = [];

    if (type === 'phone') {
      // Search by phone number
      results = await searchByPhoneNumber(q, req.user.id, offset, parseInt(limit));
    } else {
      // Search by name
      results = await searchByName(q, req.user.id, offset, parseInt(limit));
    }

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.length
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Helper function to search by phone number
async function searchByPhoneNumber(phoneNumber, userId, offset, limit) {
  try {
    // First, check if there's a registered user with this phone number
    const registeredUser = await User.findOne({
      where: { 
        phoneNumber,
        isActive: true
      }
    });

    if (registeredUser) {
      // If registered user exists, return only that result
      const spamLikelihood = await SpamReport.getSpamLikelihood(phoneNumber);
      
      // Check if the searching user is in the registered user's contacts
      const currentUser = await User.findByPk(userId);
      const isInContacts = await Contact.findOne({
        where: {
          userId: registeredUser.id,
          phoneNumber: currentUser.phoneNumber
        }
      });

      return [{
        id: registeredUser.id,
        name: registeredUser.name,
        phoneNumber: registeredUser.phoneNumber,
        email: isInContacts ? registeredUser.email : null,
        isRegisteredUser: true,
        spamLikelihood,
        source: 'registered_user'
      }];
    }

    // If no registered user, search in contacts
    const contacts = await Contact.findAll({
      where: {
        phoneNumber,
        userId: { [Op.ne]: userId } // Exclude current user's own contacts
      },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const results = await Promise.all(
      contacts.map(async (contact) => {
        const spamLikelihood = await SpamReport.getSpamLikelihood(contact.phoneNumber);
        return {
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          email: null, // Never show email for non-registered users
          isRegisteredUser: false,
          spamLikelihood,
          source: 'contact'
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Search by phone error:', error);
    return [];
  }
}

// Helper function to search by name
async function searchByName(name, userId, offset, limit) {
  try {
    const searchTerm = `%${name}%`;
    
    // Simple search in registered users (SQLite compatible)
    const registeredUsers = await User.findAll({
      where: {
        name: { [Op.like]: searchTerm },
        isActive: true,
        id: { [Op.ne]: userId } // Exclude current user
      },
      limit: Math.floor(limit / 2),
      order: [['name', 'ASC']]
    });

    // Simple search in contacts (SQLite compatible)
    const contacts = await Contact.findAll({
      where: {
        name: { [Op.like]: searchTerm },
        userId: { [Op.ne]: userId } // Exclude current user's own contacts
      },
      limit: Math.floor(limit / 2),
      order: [['name', 'ASC']]
    });

    // Combine and process results
    const allResults = [
      ...registeredUsers.map(user => ({ ...user.toJSON(), source: 'registered_user', isRegisteredUser: true })),
      ...contacts.map(contact => ({ ...contact.toJSON(), source: 'contact', isRegisteredUser: false }))
    ];

    // Remove duplicates and limit results
    const uniqueResults = allResults.slice(0, limit);

    // Add spam likelihood and handle email privacy
    const resultsWithSpamLikelihood = await Promise.all(
      uniqueResults.map(async (result) => {
        const spamLikelihood = await SpamReport.getSpamLikelihood(result.phoneNumber);
        
        // Check if current user is in the result's contacts (for email visibility)
        let email = null;
        if (result.isRegisteredUser) {
          const currentUser = await User.findByPk(userId);
          const isInContacts = await Contact.findOne({
            where: {
              userId: result.id,
              phoneNumber: currentUser.phoneNumber
            }
          });
          email = isInContacts ? result.email : null;
        }

        return {
          id: result.id,
          name: result.name,
          phoneNumber: result.phoneNumber,
          email,
          isRegisteredUser: result.isRegisteredUser || false,
          spamLikelihood,
          source: result.source
        };
      })
    );

    return resultsWithSpamLikelihood;
  } catch (error) {
    console.error('Search by name error:', error);
    return [];
  }
}

// @route   GET /api/search/details/:phoneNumber
// @desc    Get detailed information about a phone number
// @access  Private
router.get('/details/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Check if it's a registered user
    const registeredUser = await User.findOne({
      where: { 
        phoneNumber,
        isActive: true
      }
    });

    // Get spam statistics
    const spamStats = await SpamReport.getSpamStats(phoneNumber);

    // Check if current user is in the person's contacts (for email visibility)
    let email = null;
    if (registeredUser) {
      const currentUser = await User.findByPk(req.user.id);
      const isInContacts = await Contact.findOne({
        where: {
          userId: registeredUser.id,
          phoneNumber: currentUser.phoneNumber
        }
      });
      email = isInContacts ? registeredUser.email : null;
    }

    // Get all contacts with this phone number
    const contacts = await Contact.findAll({
      where: { phoneNumber },
      attributes: ['name', 'userId'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });

    const result = {
      phoneNumber,
      isRegisteredUser: !!registeredUser,
      spamStats,
      email,
      contacts: contacts.map(contact => ({
        name: contact.name,
        addedBy: contact.user.name
      }))
    };

    if (registeredUser) {
      result.registeredUser = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: email
      };
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get details'
    });
  }
});

module.exports = router; 