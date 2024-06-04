import { Request, Response } from 'express';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { getAuthToken, appendRow } from './googleSheetsService';
import crypto, { UUID } from "crypto"
import nodemailer from 'nodemailer';
  
const newTicket = async (req: Request, res: Response) => {
    try {
        const id: UUID = crypto.randomUUID();
        const name: string = req.body.name;
        const email: string = req.body.email;

        await appendSheetValues(id , name, email);
        await sendEmail(id, name, email);

        return res.status(200).send({ message: "New registrant successfully added to sheet and email sent." });
    } catch (e) {
        return res.status(401).json({ error: 'Failed to add to sheet: ' + e.message });
    }
};

async function appendSheetValues(id : UUID, name : string, email : string) {
    try {
        const auth = await getAuthToken();
        const values = [id, name, email]
        
        const spreadsheetId = process.env.SPREADSHEET_ID
        const sheetName = process.env.SHEET_NAME

        const response = await appendRow({ spreadsheetId, auth, sheetName, values });

        console.log('Row appended:', response.data);
    } catch (error) {
        console.error('Error appending row:', error);
    }   
}

async function sendEmail(id : UUID, name : string, email : string) {
    try {
        const qrCodePath = await generateQRCode(id);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Introduction to Psychology - Universitas Indonesia',
            html: `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Introduction to Psychology - Universitas Indonesia</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            padding: 10px 0;
                            background-color: #005a9c;
                            color: #ffffff;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            padding: 20px;
                        }
                        .qr-code {
                            text-align: center;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            padding: 10px 0;
                            font-size: 12px;
                            color: #666666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Introduction to Psychology</h1>
                            <p>Fakultas Psikologi, Universitas Indonesia</p>
                        </div>
                        <div class="content">
                            <p>Halo ${name},</p>
                            <p>Terima kasih telah mendaftar untuk acara <strong>Introduction to Psychology</strong> yang akan memperkenalkan Fakultas Psikologi, Universitas Indonesia.</p>
                            <p>Berikut adalah preferensi kelas yang Anda pilih:</p>
                            <ul>
                                <li>Kelas 1: Psikologi Umum</li>
                                <li>Kelas 2: Psikologi Anak</li>
                                <li>Kelas 3: Psikologi Klinis</li>
                            </ul>
                            <p>Tanggal acara utama: <strong>10 Juni 2024</strong></p>
                            <div class="qr-code">
                                <p>Gunakan kode QR di bawah ini untuk registrasi di hari-H:</p>
                                <img src="cid:qrcode" alt="QR Code">
                            </div>
                            <p>Kami tunggu kehadiran Anda!</p>
                            <p>Salam hangat,<br>Panitia Introduction to Psychology</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Fakultas Psikologi, Universitas Indonesia</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [{
                filename: 'qrcode.png',
                path: qrCodePath,
                cid: 'qrcode'
            }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

export { newTicket }