import { Request, Response } from 'express';
import { sheetRequest, sheetAppend } from './googleServices/sheetService';
import { driveUpload } from './googleServices/driveService';
import { Merch, MerchValues } from '../interfaces/sheetInterface';
import { File } from '../interfaces/fileInterface';
import { v4 as uuidv4 } from 'uuid';

let requestQueue: {req: Request, res: Response} [] = []
let isProcessing = false

const merchQueue = (req: Request, res: Response) => {
    requestQueue.push({req, res})
    processQueue()
}

const processQueue = async () => {
    if (isProcessing || requestQueue.length === 0) {
        return;
    }

    isProcessing = true

    const { req, res } = requestQueue.shift();

    try {
        await merch(req, res)
    } catch (error)  {
        console.error('Error processing merch request:', error);
    } 

    isProcessing = false
    processQueue()
}

const merch = async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { nama, idLine, noTelepon, email, alamat, kodePos, pengambilanBarang, notes, orders, extraBubblewrap, ongkir } = req.body;

    const totalHarga = await countTotalHarga(orders, extraBubblewrap, ongkir)

    const files = req.files as File[];

    if (files.length != 1) {
      res.status(401).json({ error: 'File(s) missing' });
      return;
    }

    const fileBuktiPembayaran = files[0];
    const buktiPembayaran = await driveUpload(nama, fileBuktiPembayaran, "Merch/Payment");

    let startRowIndex;
    let endRowIndex;

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

      const response = await sheetAppend([Object.values(merchValues)], "Merch");
      const updatedRange = response.data.updates.updatedRange;
      const rowNumber = parseInt(updatedRange.match(/\d+$/)[0]);
      
      if (startRowIndex === undefined)
        startRowIndex = rowNumber - 1;
      endRowIndex = rowNumber;
    }

    const sheetId = process.env.MERCH_SHEET_ID

    const mergeCellsRequests = [{
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

    await sheetRequest(mergeCellsRequests);
    res.status(200).json({ message: "New merch order added" });
  } catch (e) {
    console.error('Error while adding merch:', e.message);
    res.status(500).json({ error: 'Error while adding merch: ' + e.message });
  }
};

const countTotalHarga = async (orders: Merch [], extraBubblewrap: number, ongkir: number) => {
    let totalHarga = 0;
    orders.map((order : Merch) => {
        totalHarga += Number(order.harga)
    })

    if (extraBubblewrap) {
        totalHarga += Number(extraBubblewrap)
    }

    if (ongkir) {
        totalHarga += Number(ongkir)
    }

    return totalHarga
}

export { merchQueue }
