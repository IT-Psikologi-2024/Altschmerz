import { Request, Response } from 'express';
import { sheetAppend } from './googleServices/sheetService';
import { TicketValues } from '../interfaces/sheetInterface';
import { UUID } from 'crypto';

import { driveUpload } from '../services/googleServices/driveService';
import { File } from '../interfaces/fileInterface';

let requestQueue: {req: Request, res: Response, bukti: {buktiFollow : string, buktiPembayaran: string}} [] = []
let isProcessing = false

const ticketQueue = async (req: Request, res: Response) => {
    try {
        
        const { nama } = req.body;

        if (req.files.length != 2) {
            res.status(401).json({ error: 'File(s) missing' });
            return;
        }

        const [fileBuktiFollow, fileBuktiPembayaran]= req.files as File[]

        const buktiFollow = await driveUpload(nama, fileBuktiFollow, "Ticket/Follow")
        const buktiPembayaran = await driveUpload(nama, fileBuktiPembayaran, "Ticket/Payment")

        const bukti = { buktiFollow, buktiPembayaran }

        requestQueue.push({req, res, bukti})
        processQueue()

    } catch (e) {
        console.error('Error while uploading to drive:', e.message);
        return res.status(401).json({ error: 'Error while uploading to drive: ' + e.message });
    } 
}

const processQueue = async () => {
    if (isProcessing || requestQueue.length === 0) {
        return;
    }

    isProcessing = true

    const { req, res, bukti } = requestQueue.shift();

    try {
        await ticket(req, res, bukti)
    } catch (error)  {
        console.error('Error processing ticket request:', error);
    } 

    isProcessing = false
    processQueue()
}

const ticket = async (req: Request, res: Response, bukti: {buktiFollow : string, buktiPembayaran: string}) => {
    try {
        const id: UUID = crypto.randomUUID();
        const { nama, idLine, noTelepon, email, asalSekolah, jenisTiket, pilihanKelas} = req.body;
        // const [ pilihanPertama, pilihanKedua, pilihanKetiga ] = JSON.parse(pilihanKelas)
        const [ pilihanPertama, pilihanKedua, pilihanKetiga ] = pilihanKelas

        const { buktiFollow, buktiPembayaran } = bukti;

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

export { ticketQueue }