import { File } from '../../interfaces/fileInterface';
import { google } from 'googleapis';
import stream from "stream";

const getDriveAuthToken = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/drive']
    });
    return auth;
};

const driveUpload = async (name: string, file: File, type: string) => {
    try {
        if (!file.mimetype.startsWith('image/')) {
            throw new Error("Only image files are allowed.");
        }

        const auth = await getDriveAuthToken();
        const folder = (type === "Ticket/Payment") ? process.env.TICKET_PAYMENT_FOLDER_ID : process.env.TICKET_FOLLOW_FOLDER_ID

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        const { data } = await google.drive({ version: "v3", auth }).files.create({
            media: {
                mimeType: file.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: name,
                parents: [folder],
            },
            fields: "id",
        });

        return `https://drive.google.com/file/d/${data.id}/view`;
    } catch (e) {
        throw new Error('Error uploading file to Google Drive: ' + e.message);
    }
};

export { driveUpload }
