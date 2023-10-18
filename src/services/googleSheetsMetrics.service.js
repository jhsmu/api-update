// const googleAuthService = require('../services/googleAuthService');
const { google } = require('googleapis');
const googleSheetsMetricsService = require ('../controllers/googleSheetsMetrics.controller')
const { getDataFromDatabase } = require ('../models/pipelinesMetrics'); 

const googleSheetId = '127lQbFtVqXWdq0eR3VkmUAkyjIxExHSixCRNbWxTObQ';

async function findLastDataRow(client) {
  try {
    console.log('miremos aqui');
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId:googleSheetId,
      range: `metrics!A:A`, 
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      // No hay datos en la columna, la hoja está vacía.
      return 1;
    }

    // Encuentra el índice de la última fila con datos.
    const lastIndex = values.length;
    return lastIndex + 1; // Devuelve la siguiente fila después de la última con datos.
  } catch (error) {
    console.error('Error al encontrar la última fila con datos:', error);
    throw error;
  }
}

async function insertDataArrayAfterLastRow(client, nextRow, dataArray) {
  try {

    console.log('insertData nextRow: ',nextRow);
     console.log('ciente',client);

    const sheets = google.sheets({ version: 'v4', auth: client });
    const rangeToInsert = `metrics!A${nextRow}`; 

    console.log('Contenido de dataArray:', dataArray);

    const values = dataArray.map(item => [item.pipelineName, item.buildNumber, item.executionResult, item.buildUser, item.appName, item.action, item.type, item.environment, item.originBranch, item.deployedBranch, item.targetBranch, item.executionStart, item.executionEnd, item.duration, item.durationSeg]);

    await sheets.spreadsheets.values.update({
      spreadsheetId:googleSheetId,
      range: rangeToInsert,
      valueInputOption: 'RAW',
      resource: {
        values
      },
    });

    return "Datos actualizados correctamente"
  } catch (error) {
    console.error('Error al insertar datos en la fila posterior al último registro:', error);
    throw error;
  }
}

async function isSheetEmpty(client) {
  try {
    const sheets = google.sheets({ version: 'v4', auth: client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId:googleSheetId,
      range: `metrics!A1:A1`, // Verifica si la primera celda está vacía.
    });
    const values = response.data.values;

    // Si no se encontraron valores, la hoja está vacía.
    return !values || values.length === 0;
  } catch (error) {
    console.error('Error al verificar si la hoja está vacía:', error);
    throw error;
  }
}

 async function updateGoogleSheet(req, res, client, mongoData) {
   try {
    console.log('informacion enviada?');
     const sheets = google.sheets({ version: 'v4', auth: client });
     const values = [
       ["pipelineName", "buildNumber", "executionResult", "buildUser", "appName", "action", "type", "environment", "originBranch", "deployedBranch", "targetBranch", "executionStart", "executionEnd", "duration", "durationSeg"],
       ...mongoData.map(item => [item.pipelineName, item.buildNumber, item.executionResult, item.buildUser, item.appName, item.action, item.type, item.environment, item.originBranch, item.deployedBranch, item.targetBranch, item.executionStart, item.executionEnd, item.duration, item.durationSeg])
     ];
     console.log('update',values)
     await sheets.spreadsheets.values.update({
       spreadsheetId: googleSheetId,
      range: 'metrics!A1',
      valueInputOption: 'RAW',
       resource: { values },
     });

     console.log('Datos actualizados correctamente en Google Sheets');

    const response = {
       message: 'Los datos se actualizaron correctamente'
     };

    //  res.status(200).send(response);
   } catch (error) {
     console.error('Error updating Google Sheets:', error);
     const errorMessage = 'Error updating Google Sheets';
     res.status(500).send(errorMessage);
   }
 }


async function getLastInsertedRecord(req, res, client) {
  try {
    console.log('getLasInsertRecord');
    const sheets = google.sheets({ version: 'v4', auth: client });
    
    const isEmptySheet = await isSheetEmpty(client); // Pasar "client" como argumento
    if (isEmptySheet) {
      const mongoData = await googleSheetsMetricsService.getMongoData(); // Obtener mongoData aquí
      await updateGoogleSheet(req, res, client, mongoData); // Pasar "mongoData" como argumento aquí
    } else {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: googleSheetId,
        range: `metrics!L:L`,
      });
      console.log('getLasInsertRecord en else');      
      const values = response.data.values;

      if (!values || values.length === 0) {
        console.log('No se encontraron registros en la hoja de cálculo.');
        return null;
      }

      // Obtén el último registro insertado (fila más reciente).
      const lastRecord = values[values.length - 1];
      const mongoNewData = await googleSheetsMetricsService.getUpdateData(lastRecord[0]);
      const lastDataRow = await findLastDataRow(client);
      const insertLastData = await insertDataArrayAfterLastRow(client, lastDataRow, mongoNewData);

      console.log('dato de mongoNewData',mongoNewData);
      console.log('despues del else', insertLastData);
      //  res.status(200).send(insertLastData);
    }
  } catch (error) {
    console.error('Error al obtener el último registro:', error);
    // res.status(500).send('Error al obtener el último registro');
  }
}


module.exports =  { updateGoogleSheet, getLastInsertedRecord, findLastDataRow, getDataFromDatabase }