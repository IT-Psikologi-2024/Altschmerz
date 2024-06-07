import { SheetValues } from '../interfaces/sheetInterface';
import { Request, Response } from 'express';
import crypto, { UUID } from "crypto"

const { google } = require('googleapis');

const newTicket = async (req: Request, res: Response) => {
    try {
        const id: UUID = crypto.randomUUID();
        const jenisTiket: string = req.body.jenisTiket;
        const idLine: string = req.body.idLine;
        const nama: string = req.body.nama;
        const noTelepon: string = req.body.noTelepon;
        const email: string = req.body.email;
        const asalSekolah: string = req.body.asalSekolah;
        const pilihanKelasList: string[] = req.body.pilihanKelas;
        const buktiFollow: string = req.body.buktiFollow;
        const buktiPembayaran: string = req.body.buktiPembayaran;
        const hadir: string = "Tidak"

        const pilihanKelas = pilihanKelasList.join(", ")

        const sheetValues: SheetValues = { id, jenisTiket, idLine, nama, noTelepon, email, asalSekolah, pilihanKelas, buktiFollow, buktiPembayaran, hadir};

        await appendSheetValues(sheetValues);
        // await sendEmail(id, nama, email);

        return res.status(200).send({ message: "New registrant successfully added to sheet." });
    } catch (e) {
        return res.status(401).json({ error: 'Failed to add to sheet: ' + e.message });
    }
};

async function getSheetAuthToken() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const authToken = await auth.getClient();
    return authToken;
}

async function appendSheetValues(values: SheetValues) {
    try {
        const auth = await getSheetAuthToken();
        const sheets = google.sheets('v4');
        
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const sheetName = process.env.SHEET_NAME;

        const response= await sheets.spreadsheets.values.append({
                spreadsheetId,
                auth,
                range: sheetName,
                valueInputOption: 'RAW',
                resource: {
                    values: [Object.values(values)],
                },
            });
        
        console.log('Row appended:', response.data);

        return response;

    } catch (e) {
        throw new Error('Failed to append row: ' + e.message);
    }
}

export { newTicket }