module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^\+?[1-9]\d{1,14}$/, // E.164 format
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
        len: [5, 255]
      }
    },
    isRegisteredUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    registeredUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['phoneNumber']
      },
      {
        fields: ['name']
      },
      {
        fields: ['registeredUserId']
      },
      {
        unique: true,
        fields: ['userId', 'phoneNumber'],
        name: 'unique_user_contact'
      }
    ],
    hooks: {
      beforeCreate: async (contact) => {
        // Check if the contact is a registered user
        const User = sequelize.models.User;
        const registeredUser = await User.findByPhoneNumber(contact.phoneNumber);
        if (registeredUser) {
          contact.isRegisteredUser = true;
          contact.registeredUserId = registeredUser.id;
        }
      },
      beforeUpdate: async (contact) => {
        if (contact.changed('phoneNumber')) {
          // Check if the contact is a registered user
          const User = sequelize.models.User;
          const registeredUser = await User.findByPhoneNumber(contact.phoneNumber);
          if (registeredUser) {
            contact.isRegisteredUser = true;
            contact.registeredUserId = registeredUser.id;
          } else {
            contact.isRegisteredUser = false;
            contact.registeredUserId = null;
          }
        }
      }
    }
  });

  // Instance methods
  Contact.prototype.getSpamLikelihood = async function() {
    const SpamReport = sequelize.models.SpamReport;
    const totalReports = await SpamReport.count({
      where: { phoneNumber: this.phoneNumber }
    });
    
    // Simple spam likelihood calculation
    // In production, you might want a more sophisticated algorithm
    if (totalReports === 0) return 0;
    if (totalReports <= 2) return 25;
    if (totalReports <= 5) return 50;
    if (totalReports <= 10) return 75;
    return 100;
  };

  return Contact;
}; 