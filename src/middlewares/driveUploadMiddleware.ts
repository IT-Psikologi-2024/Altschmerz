require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import { driveUpload as driveUploadService} from '../services/googleServices/driveService';
import { File } from '../interfaces/fileInterface';

const ticketDriveUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const { nama } = req.body;

        if (req.files.length != 2) {
            res.status(401).json({ error: 'File(s) missing' });
            return;
        }

        const [fileBuktiFollow, fileBuktiPembayaran]= req.files as File[]

        res.locals.buktiFollow = await driveUploadService(nama, fileBuktiFollow, "Ticket/Follow")
        res.locals.buktiPembayaran = await driveUploadService(nama, fileBuktiPembayaran, "Ticket/Payment")

        next();
    } catch (e) {
        console.error('Error while uploading to drive:', e.message);
        return res.status(401).json({ error: 'Error while uploading to drive: ' + e.message });
    }
};

const merchDriveUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const { nama } = req.body;

        if (req.files.length != 1) {
            res.status(401).json({ error: 'File(s) missing' });
            return;
        }

        const [fileBuktiPembayaran] = req.files as File[]

        res.locals.buktiPembayaran = await driveUploadService(nama, fileBuktiPembayaran, "Merch/Payment");

        next();
    } catch (e) {
        console.error('Error while uploading to drive:', e.message);
        return res.status(401).json({ error: 'Error while uploading to drive: ' + e.message });
    }
};

export { ticketDriveUpload, merchDriveUpload }