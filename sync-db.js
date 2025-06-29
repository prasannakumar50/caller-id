require('dotenv').config();
const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synchronized successfully!');
    
    console.log('📋 Available tables:');
    const tables = await sequelize.showAllSchemas();
    console.log(tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase(); 