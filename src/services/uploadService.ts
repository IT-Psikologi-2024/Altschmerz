import { File } from '../interfaces/fileInterface';
import { google } from 'googleapis';
import { Request, Response } from 'express';
import stream from "stream";

const fileUpload = async (req: Request, res: Response, type: string) => {
    try {

        if (!req.files || (req.files as File[]).length === 0) {
            return res.status(400).json({error : "No files were uploaded."});
        }

        const files = req.files as File[];
        const file = files[0];

        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({error : "Only image files are allowed."});
        }

        const auth = await getDriveAuthToken();
        
        const link = await upload(auth, file, type);
    
        res.status(200).json({message : "File uploaded to Google Drive", link : link});
    } catch (e) {
        console.error('Error uploading file to Google Drive:', e.message);
        res.status(500).json({ error: 'Error uploading file to Google Drive: ' + e.message });
    }
};

const getDriveAuthToken = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/drive']
    });
    return auth;
};

const upload = async (auth : any, fileObject : any, type : string) => {

    const folder = (type === "payment") ? process.env.PAYMENT_FOLDER_ID : process.env.FOLLOW_FOLDER_ID

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const { data } = await google.drive({ version: "v3", auth }).files.create({
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: [folder],
        },
        fields: "id",
    });

    return `https://drive.google.com/file/d/${data.id}/view`;
};

export { fileUpload }
