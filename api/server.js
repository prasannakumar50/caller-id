const express = require('express');
const { sequelize } = require('../models');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const contactRoutes = require('../routes/contacts');
const searchRoutes = require('../routes/search');
const spamRoutes = require('../routes/spam');
const errorHandler = require('../middleware/errorHandler');
const notFound = require('../middleware/notFound');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/spam', spamRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = (req, res) => {
  app(req, res);
}; 