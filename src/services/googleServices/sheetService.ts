import { TicketValues } from '../../interfaces/sheetInterface';

const { google } = require('googleapis');

const getSheetAuthToken = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authToken = await auth.getClient();
    return authToken;
}

const sheetAppend = async (value : TicketValues, type : string) => {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets('v4');
        
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const sheetName = (type === "Ticket") ? process.env.TICKET_SHEET_NAME : process.env.MERCH_SHEET_NAME;

        const response= await sheets.spreadsheets.values.append({
                spreadsheetId,
                auth,
                range: sheetName,
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

export { sheetAppend }