import { TicketValues } from '../../interfaces/sheetInterface';
import { MerchValues } from '../../interfaces/sheetInterface';

const { google } = require('googleapis');
const spreadsheetId = process.env.SPREADSHEET_ID;

const getSheetAuthToken = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authToken = await auth.getClient();
    return authToken;
}

const sheetAppend = async (values : TicketValues [][]| MerchValues [][], range : string) => {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets({auth, version: "v4"})
        
        const response= await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                resource: {
                    values: values,
                },
            });
        
        console.log('Row appended:', response.data);

        return response;

    } catch (e) {
        throw new Error('Failed to append row: ' + e.message);
    }
};

const sheetGet = async (range : string) => {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets({auth, version: "v4"})
        
        const response = await sheets.spreadsheets.values.get({spreadsheetId, range});
        
        return response.data.values;
    } catch (e) {
        throw new Error('Failed to get row: ' + e.message);
    }
};

const sheetUpdate = async (value : string, range : string) => {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets({auth, version: "v4"})
        
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId, 
            range, 
            valueInputOption : 'RAW', 
            resource: {
                values: [[value]],
            }}
        );
        
        return response;
    } catch (e) {
        throw new Error('Failed to update value: ' + e.message);
    }
}

const sheetRequest= async (requests: any) => {
  const auth = await getSheetAuthToken();
  const sheets = google.sheets({ auth, version: 'v4' });

  const batchUpdateRequest = { requests };
  const result = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: batchUpdateRequest
  });

  return result;
}

export { sheetAppend, sheetGet, sheetUpdate, sheetRequest }