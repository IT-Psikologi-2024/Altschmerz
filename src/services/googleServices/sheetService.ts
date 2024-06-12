import { TicketValues } from '../../interfaces/sheetInterface';
import { MerchValues } from '../../interfaces/sheetInterface';

const { google } = require('googleapis');

const getSheetAuthToken = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authToken = await auth.getClient();
    return authToken;
}

const sheetAppend = async (value : TicketValues | MerchValues, range : string) => {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets({auth, version: "v4"})
        
        const spreadsheetId = process.env.SPREADSHEET_ID;

        const response= await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                resource: {
                    values: [Object.values(value)],
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
        
        const spreadsheetId = process.env.SPREADSHEET_ID;

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
        
        const spreadsheetId = process.env.SPREADSHEET_ID;

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

async function sheetMerge(spreadsheetId: string, sheetId: number, startRowIndex: number, endRowIndex: number) {
  const auth = await getSheetAuthToken();
  const sheets = google.sheets({ auth, version: 'v4' });

  const requests = [{
    mergeCells: {
      range: {
        sheetId: sheetId,
        startRowIndex: startRowIndex,
        endRowIndex: endRowIndex,
        startColumnIndex: 0,
        endColumnIndex: 9
      },
      mergeType: 'MERGE_COLUMNS'
    }
  },
  {
    mergeCells: {
      range: {
        sheetId: sheetId,
        startRowIndex: startRowIndex,
        endRowIndex: endRowIndex,
        startColumnIndex: 12,
        endColumnIndex: 18
      },
      mergeType: 'MERGE_COLUMNS'
    }
  }
];

  const batchUpdateRequest = { requests };
  const result = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: batchUpdateRequest
  });

  return result;
}

export { getSheetAuthToken, sheetAppend, sheetGet, sheetUpdate, sheetMerge}