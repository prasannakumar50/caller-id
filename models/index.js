const { Sequelize } = require('sequelize');
const path = require('path');

// Determine database configuration
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

let sequelize;

if (useSQLite) {
  // Use SQLite for development (easier setup)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('📦 Using SQLite database for development');
} else {
  // Use PostgreSQL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );
  console.log('🐘 Using PostgreSQL database');
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Contact = require('./Contact')(sequelize, Sequelize);
db.SpamReport = require('./SpamReport')(sequelize, Sequelize);

// Define associations
db.User.hasMany(db.Contact, { 
  foreignKey: 'userId', 
  as: 'contacts',
  onDelete: 'CASCADE'
});
db.Contact.belongsTo(db.User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// User can have many spam reports
db.User.hasMany(db.SpamReport, { 
  foreignKey: 'reportedBy', 
  as: 'spamReports',
  onDelete: 'CASCADE'
});
db.SpamReport.belongsTo(db.User, { 
  foreignKey: 'reportedBy', 
  as: 'reporter'
});

// Contact can have many spam reports
// db.Contact.hasMany(db.SpamReport, { 
//   foreignKey: 'phoneNumber', 
//   sourceKey: 'phoneNumber',
//   as: 'spamReports'
// });
// db.SpamReport.belongsTo(db.Contact, { 
//   foreignKey: 'phoneNumber', 
//   targetKey: 'phoneNumber',
//   as: 'contact'
// });

module.exports = db; 