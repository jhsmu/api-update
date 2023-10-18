const fs = require('fs'); // Importa el módulo fs para trabajar con archivos
const cron = require('node-cron'); // Importa el módulo cron para programar tareas

const express = require('express');
const app = require('./app'); // Importa tu archivo app.js

const { connectToDatabase } = require('./models/pipelinesMetrics');
const googleAuthService = require('./controllers/googleAuthService'); // Importa tu módulo googleAuthService
const googleSheetsMetricsService = require('./controllers/googleSheetsMetrics.controller'); // Importa tu módulo googleSheetsMetricsService
const googleSheetsMetric = require('./services/googleSheetsMetrics.service'); // Importa tu módulo googleSheetsMetric

async function startServer() {
  // Conecta a la base de datos
  await connectToDatabase();

  // Inicia el servidor
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Programa la tarea para ejecutarla cada X minutos (por ejemplo, cada 30 minutos)
  cron.schedule('*/3 * * * *', async () => {
    try {
      console.log("se esta ejecutando")
      // Lee el token de acceso almacenado desde un archivo (por ejemplo, token.json)
      const token = fs.readFileSync('token.json', 'utf8');
      const client = googleAuthService.getClientWithToken(token); // Obtiene el cliente con el token almacenado
      const mongoData = await googleSheetsMetricsService.getMongoData();
      await googleSheetsMetric.getLastInsertedRecord(null, null, client, mongoData);
      console.log('mongodata,',mongoData);
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
    }
  });
}

startServer();
