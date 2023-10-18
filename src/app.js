const express = require('express');
const googleSheetRoutes = require('./routes/routes');
const app = express();

// Rutas
app.use('/api', googleSheetRoutes);

module.exports = app;
