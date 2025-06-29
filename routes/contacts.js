const express = require('express');
const { Contact, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateContact, validateUUID } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/contacts
// @desc    Get all contacts for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    // Get spam likelihood for each contact
    const contactsWithSpamLikelihood = await Promise.all(
      contacts.map(async (contact) => {
        const spamLikelihood = await contact.getSpamLikelihood();
        return {
          ...contact.toJSON(),
          spamLikelihood
        };
      })
    );

    res.json({
      success: true,
      data: {
        contacts: contactsWithSpamLikelihood,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contacts'
    });
  }
});

// @route   POST /api/contacts
// @desc    Add a new contact
// @access  Private
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;

    // Check if contact already exists for this user
    const existingContact = await Contact.findOne({
      where: {
        userId: req.user.id,
        phoneNumber
      }
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: 'Contact with this phone number already exists'
      });
    }

    // Create new contact
    const contact = await Contact.create({
      userId: req.user.id,
      name,
      phoneNumber,
      email
    });

    // Get spam likelihood
    const spamLikelihood = await contact.getSpamLikelihood();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: {
        contact: {
          ...contact.toJSON(),
          spamLikelihood
        }
      }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add contact'
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get a specific contact
// @access  Private
router.get('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Get spam likelihood
    const spamLikelihood = await contact.getSpamLikelihood();

    res.json({
      success: true,
      data: {
        contact: {
          ...contact.toJSON(),
          spamLikelihood
        }
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact'
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update a contact
// @access  Private
router.put('/:id', validateUUID, validateContact, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email } = req.body;

    const contact = await Contact.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check if new phone number already exists for this user
    if (phoneNumber !== contact.phoneNumber) {
      const existingContact = await Contact.findOne({
        where: {
          userId: req.user.id,
          phoneNumber
        }
      });

      if (existingContact) {
        return res.status(409).json({
          success: false,
          message: 'Contact with this phone number already exists'
        });
      }
    }

    // Update contact
    await contact.update({
      name,
      phoneNumber,
      email
    });

    // Get spam likelihood
    const spamLikelihood = await contact.getSpamLikelihood();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        contact: {
          ...contact.toJSON(),
          spamLikelihood
        }
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact'
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact
// @access  Private
router.delete('/:id', validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
});

module.exports = router; 