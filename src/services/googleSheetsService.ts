const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken() {
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES
    });
    const authToken = await auth.getClient();
    return authToken;
}

async function appendRow({spreadsheetId, auth, sheetName, values} : any) {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      auth,
      range: sheetName,
      valueInputOption: 'RAW',
      resource: {
        values: [values],
      },
    });
    return res;
  }

export {
    getAuthToken,
    appendRow
}