module.exports = (sequelize, DataTypes) => {
  const SpamReport = sequelize.define('SpamReport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^\+?[1-9]\d{1,14}$/, // E.164 format
        notEmpty: true
      }
    },
    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.ENUM('robocall', 'scam', 'telemarketing', 'harassment', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'spam_reports',
    timestamps: true,
    indexes: [
      {
        fields: ['phoneNumber']
      },
      {
        fields: ['reportedBy']
      },
      {
        fields: ['reason']
      },
      {
        fields: ['isResolved']
      },
      {
        fields: ['createdAt']
      },
      {
        unique: true,
        fields: ['phoneNumber', 'reportedBy'],
        name: 'unique_user_spam_report'
      }
    ],
    hooks: {
      beforeCreate: async (report) => {
        // Check if user already reported this number
        const existingReport = await SpamReport.findOne({
          where: {
            phoneNumber: report.phoneNumber,
            reportedBy: report.reportedBy
          }
        });
        
        if (existingReport) {
          throw new Error('User has already reported this phone number');
        }
      }
    }
  });

  // Instance methods
  SpamReport.prototype.resolve = async function(resolvedByUserId) {
    this.isResolved = true;
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedByUserId;
    return this.save();
  };

  // Class methods
  SpamReport.getSpamLikelihood = async function(phoneNumber) {
    const totalReports = await this.count({
      where: { 
        phoneNumber,
        isResolved: false
      }
    });
    
    // Calculate spam likelihood based on number of reports
    if (totalReports === 0) return 0;
    if (totalReports <= 2) return 25;
    if (totalReports <= 5) return 50;
    if (totalReports <= 10) return 75;
    return 100;
  };

  SpamReport.getSpamStats = async function(phoneNumber) {
    const reports = await this.findAll({
      where: { phoneNumber },
      attributes: [
        'reason',
        [sequelize.fn('COUNT', sequelize.col('reason')), 'count']
      ],
      group: ['reason'],
      raw: true
    });
    
    const totalReports = await this.count({
      where: { phoneNumber }
    });
    
    return {
      totalReports,
      reportsByReason: reports,
      spamLikelihood: await this.getSpamLikelihood(phoneNumber)
    };
  };

  return SpamReport;
}; 