import { Request, Response } from 'express';
import { sheetAppend } from './googleServices/sheetService';
import { TicketValues } from '../interfaces/sheetInterface';
import { UUID } from 'crypto';

let requestQueue: {req: Request, res: Response} [] = []
let isProcessing = false

const ticketQueue = (req: Request, res: Response) => {
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
        await ticket(req, res)
    } catch (error)  {
        console.error('Error processing ticket request:', error);
    } 

    isProcessing = false
    processQueue()
}

const ticket = async (req: Request, res: Response) => {
    try {
        const id: UUID = crypto.randomUUID();
        const { nama, idLine, noTelepon, email, asalSekolah, jenisTiket, pilihanKelas} = req.body;
        // const [ pilihanPertama, pilihanKedua, pilihanKetiga ] = JSON.parse(pilihanKelas)
        const [ pilihanPertama, pilihanKedua, pilihanKetiga ] = pilihanKelas

        const buktiFollow = res.locals.buktiFollow
        const buktiPembayaran = res.locals.buktiPembayaran

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