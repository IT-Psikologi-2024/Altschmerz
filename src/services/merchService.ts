import { Merch, MerchValues } from '../interfaces/sheetInterface';
import { File } from '../interfaces/fileInterface';
import { Request, Response } from 'express';
import { UUID } from 'crypto';
import { driveUpload } from './googleServices/driveService';
import { sheetAppend } from './googleServices/sheetService';

const merch = async (req: Request, res: Response) => {
    try {   
        const id: UUID = crypto.randomUUID();
        const { nama, idLine, noTelepon, email, alamat, kodePos, pengambilanBarang, notes, order, totalHarga } = req.body;

        const mappedOrders = order.map((item : Merch ) => `${item.nama} - ${item.jumlah} pcs`);
        const ordersString = mappedOrders.join(', ');
        
        const files = req.files as File[]

        if (files.length != 1) {
            res.status(401).json({ error: 'File(s) missing' });
            return;
        }

        const fileBuktiPembayaran = files[0]

        const buktiPembayaran = await driveUpload(nama, fileBuktiPembayaran, "Merch/Payment")

        const merchValues: MerchValues = { id, nama, idLine, noTelepon, email, alamat, kodePos, pengambilanBarang, notes, order : ordersString, totalHarga, buktiPembayaran};

        await sheetAppend(merchValues, "Merch")

        res.status(200).json({message : "New merch order added"});
    } catch (e) {
        console.error('Error while adding merch:', e.message);
        res.status(500).json({ error: 'Error while adding merch: ' + e.message });
    }
};

export { merch }