const { Router } = require ("express");
const bodyParser = require  ('body-parser');
const googleSheetsMetric = require  ('../services/googleSheetsMetrics.service');
const googleSheetsMetricsService = require  ('../controllers/googleSheetsMetrics.controller');
const googleAuthService = require('../controllers/googleAuthService');

const router = Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/insert', async (req, res) => {
  try {
    const authUrl = await googleAuthService.getAuthorizationUrl(); // Esperar a que se resuelva la promesa.
    res.redirect(authUrl);
    console.log('URL de redirección:', authUrl);
  } catch (error) {
    console.error('Error al obtener URL de autorización:', error);
    res.status(500).send('Error al obtener URL de autorización');
  }
});

router.get('/oauth2callback', async (req, res) => {
  const authorizationCode = req.query.code;
  console.log('Authorization Code:', authorizationCode);
  if (!authorizationCode) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const client = await googleAuthService.getClient(authorizationCode);
    const mongoData = await googleSheetsMetricsService.getMongoData();
    // Verifica si el proceso de autenticación y obtención de datos fue exitoso antes de llamar a getLastInsertedRecord.
      await googleSheetsMetric.getLastInsertedRecord(req, res, client, mongoData);
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    res.status(500).send('Error updating Google Sheets');
  }
});

module.exports =  router;