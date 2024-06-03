import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { getAuthToken, appendRow } from './googleSheetsService';
  
const newTicket = async (req : Request, res : Response) => {
    try {
        const nama : string = req.body.nama
        const email : string = req.body.email

        appendSheetValues(nama, email);

        return res.status(200).send({message:"New registrant succesfully added to sheet."})

    } catch (e){
        return res.status(401).json({ error: 'Failed to add to sheet: ' + e.message});
    }
}

async function appendSheetValues(nama : string, email : string) {
    try {
        const auth = await getAuthToken();
        const values = [nama, email]
        
        const spreadsheetId = process.env.SPREADSHEET_ID
        const sheetName = process.env.SHEET_NAME

        const response = await appendRow({ spreadsheetId, auth, sheetName, values });

        console.log('Row appended:', response.data);
    } catch (error) {
        console.error('Error appending row:', error);
    }   
}

export { newTicket }