import { Request, Response } from 'express';
import { driveUpload } from './googleServices/driveService';
import { sheetAppend } from './googleServices/sheetService';
import { TicketValues } from '../interfaces/sheetInterface';
import { File } from '../interfaces/fileInterface';
import { UUID } from 'crypto';

const ticket = async (req: Request, res: Response) => {
    try {
        const id: UUID = crypto.randomUUID();
        const { nama, idLine, noTelepon, email, asalSekolah, jenisTiket, pilihanKelas} = req.body;
        const [ pilihanPertama, pilihanKedua, pilihanKetiga ] = JSON.parse(pilihanKelas)

        const files = req.files as File[]

        if (files.length != 2) {
            res.status(401).json({ error: 'File(s) missing' });
            return;
        }

        const fileBuktiFollow = files[0]
        const fileBuktiPembayaran = files[1]

        const buktiFollow = await driveUpload(nama, fileBuktiFollow, "Ticket/Follow")
        const buktiPembayaran = await driveUpload(nama, fileBuktiPembayaran, "Ticket/Payment")

        const ticketValues: TicketValues = { 
            id, 
            nama, 
            idLine, 
            noTelepon, 
            email, 
            asalSekolah, 
            jenisTiket, 
            pilihanPertama, 
            pilihanKedua,
            pilihanKetiga,
            buktiFollow, 
            buktiPembayaran
        };

        await sheetAppend([Object.values(ticketValues)], "Ticket")
        
        res.status(200).json({message : "Ticketing success"});
    } catch (e) {
        console.error('Error while ticketing:', e.message);
        res.status(500).json({ error: 'Error while ticketing: ' + e.message });
    }
};

export { ticket }