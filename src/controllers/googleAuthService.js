const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

 const oauth2Client = new OAuth2Client({
   clientId: '54084495662-q86or21d576o45a0jjdvv4f56rrdeoav.apps.googleusercontent.com',
   clientSecret: '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',
   redirectUri: 'http://localhost:3001/api/oauth2callback',
 });

function getAuthorizationUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    response_type: 'code',
  });
}

async function getClient(authorizationCode) {
  try {
    const tokenResponse = await oauth2Client.getToken(authorizationCode);
    oauth2Client.setCredentials(tokenResponse.tokens);
    console.log('Access token obtained successfully:', tokenResponse.tokens.access_token);

    fs.writeFileSync('token.json', JSON.stringify(tokenResponse.tokens));

    // Verifica si el token de acceso no está vencido
    const currentTimestamp = Date.now();
    if (oauth2Client.credentials.expiry_date && oauth2Client.credentials.expiry_date > currentTimestamp) {
      console.log('El token de acceso no está vencido, el cliente está autenticado.');
    } else {
      console.log('El token de acceso está vencido o no existe, el cliente no está autenticado.');
    }

    return oauth2Client;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}

function getClientWithToken() {
  try {
    // Lee el token de acceso almacenado desde el archivo
    const token = fs.readFileSync('token.json', 'utf8');
    
    // Configura el cliente OAuth2 con el token de acceso almacenado
    oauth2Client.setCredentials(JSON.parse(token));

    return oauth2Client;
  } catch (error) {
    console.error('Error reading token:', error);
    throw error;
  }
}

module.exports = { getAuthorizationUrl, getClient, getClientWithToken };
