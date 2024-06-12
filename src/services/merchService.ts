import { Merch, MerchValues } from '../interfaces/sheetInterface';
import { File } from '../interfaces/fileInterface';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { driveUpload } from './googleServices/driveService';
import { getSheetAuthToken, sheetAppend, sheetMerge } from './googleServices/sheetService';
import { google } from 'googleapis';

const merch = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { nama, idLine, noTelepon, email, alamat, kodePos, pengambilanBarang, notes, orders, extraBubblewrap, ongkir } = req.body;

    const files = req.files as File[];

    if (files.length != 1) {
      res.status(401).json({ error: 'File(s) missing' });
      return;
    }

    const fileBuktiPembayaran = files[0];
    const buktiPembayaran = await driveUpload(nama, fileBuktiPembayaran, "Merch/Payment");

    const sheetName = "Merch";
    let startRowIndex;
    let endRowIndex;

    let totalHarga = 0;
    orders.map((order : Merch) => {
        totalHarga += Number(order.harga)
        console.log(totalHarga)
    })

    if (extraBubblewrap) {
        totalHarga += Number(extraBubblewrap)
    }

    if (ongkir) {
        totalHarga += Number(ongkir)
    }

    for (const item of orders) {
      const merchValues: MerchValues = {
        id,
        nama,
        idLine,
        noTelepon,
        email,
        alamat,
        kodePos,
        pengambilanBarang,
        notes,
        item: item.nama,
        jumlah: item.jumlah,
        harga: item.harga,
        extraBubblewrap,
        ongkir,
        totalHarga,
        buktiPembayaran
      };

      const response = await sheetAppend(merchValues, sheetName);
      const updatedRange = response.data.updates.updatedRange;
      const rowNumber = parseInt(updatedRange.match(/\d+$/)[0]);
      
      if (startRowIndex === undefined) startRowIndex = rowNumber - 1;
      endRowIndex = rowNumber;
    }

    const sheetsService = google.sheets({ auth: await getSheetAuthToken(), version: 'v4' });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const sheetInfo = await sheetsService.spreadsheets.get({ spreadsheetId });
    const sheetId = sheetInfo.data.sheets.find(sheet => sheet.properties.title === sheetName).properties.sheetId;

    await sheetMerge(spreadsheetId, sheetId, startRowIndex, endRowIndex);

    res.status(200).json({ message: "New merch order added" });
  } catch (e) {
    console.error('Error while adding merch:', e.message);
    res.status(500).json({ error: 'Error while adding merch: ' + e.message });
  }
};

export { merch }
