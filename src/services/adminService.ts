import { Request, Response } from 'express';
import { generateJWT } from '../utils/jwtGenerator';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { gmailSend } from './googleServices/gmailService';
import { generateQRCode } from '../utils/qrCodeGenerator';
import fs from 'fs/promises';
import path from 'path';

const login = async (req: Request, res: Response) => {
    try {   
        const { username, password } = req.body;
        
        const admin_username = process.env.ADMIN_USERNAME
        const admin_password = process.env.ADMIN_PASSWORD

        if ( username !== admin_username || password !== admin_password) {
            res.status(401).json({ error: 'Invalid credentials'});
            return;
        }

        const userId = process.env.ADMIN_ID
        const token = generateJWT(userId)
            
        res.status(200).send({message:"Logged in succesfully", token: token})
    } catch (e) {
        console.error('Error while logging in:', e.message);
        res.status(500).json({ error: 'Error while logging in: ' + e.message });
    }
};

const attend = async (req: Request, res: Response) => {
    try {
        const attendeeId = req.params.id

        const sheetData = await sheetGet('Ticket!A1:P1000')
        const ids = sheetData.map((id : string[]) => id[0])
        const verified = sheetData.map((row : string[]) => row[13]);

        let rowNumber = 0;
        for (let index = 0; index < ids.length; index++) {
            if (ids[index] === attendeeId && verified[index] === "Iya") {
                rowNumber = index + 1
                break;
            }
        }

        if (rowNumber === 0) {
            res.status(401).json({error : "Attendance Fail"});
            return;
        }

        await sheetUpdate('Iya', `Ticket!P${rowNumber}`)

        const name = await sheetGet(`Ticket!B${rowNumber}`)
        const nameString = name[0][0]

        res.status(200).json({message : nameString});
    } catch (e) {
        console.error('Error while attending:', e.message);
        res.status(500).json({ error: 'Error while attending: ' + e.message });
    }
};

const getVerifiedAttendee = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:P1000');

        const data = sheetData
            .filter((row : string[]) => row[13] === "Iya" && row[14] === "Pending")
            .map((row : string[]) => {
                const name = row[1];
                const email = row[4];
                return { name, email};
            });

        res.status(200).json( data );
    } catch (e) {
        console.error('Error while getting verified attendee:', e.message);
        res.status(500).json({ error: 'Error while getting verified attendee: ' + e.message });
    }
}

const ticketEmail = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:P1000');
        
        const ids = sheetData.map((row : string[])=> row[0]);
        const names = sheetData.map((row : string[])=> row[1]);
        const emails = sheetData.map((row : string[])=> row[4]);
        const kelases = sheetData.map((row : string[])=> row[12]);
        const verified = sheetData.map((row : string[])=> row[13]);
        const emailStatus = sheetData.map((row : string[])=> row[14]);

        for (let index = 1; index < ids.length; index++) {
            const id = ids[index];
            const name = names[index];
            const email = emails[index];
            const kelas = kelases[index];
            const isVerified = verified[index] === "Iya";
            const isPending = emailStatus[index] === "Pending";

            if (isVerified && isPending) {

                const qrCodePath = await generateQRCode(id);
                const headerPath = path.join(__dirname, '../../public/header-email.png');
                const templatePath = path.join(__dirname, '../templates/ticketingEmailTemplate.html');

                let html = await fs.readFile(templatePath, 'utf-8');
                html = html.replace('{{name}}', name);
                html = html.replace('{{kelas}}', kelas);
                html = html.replace('{{whatsappLink}}', 'https://faq.whatsapp.com/5913398998672934/?locale=id_ID'); //TODO

                const mailOptions = {
                    from: process.env.GMAIL_EMAIL,
                    to: email,
                    subject: 'Introduction to Psychology - Universitas Indonesia',
                    html: html,
                    attachments: [{
                        filename: 'qrcode.png',
                        path: qrCodePath,
                        cid: 'qrcode'
                    },{
                        filename: 'header-email.png',
                        path: headerPath,
                        cid: 'header'
                    }]
                };
                
                await gmailSend(mailOptions);
                await sheetUpdate('Terkirim', `Ticket!O${index + 1}`);
            }
        }

        res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error('Error while sending ticket email:', e.message);
        res.status(500).json({ error: 'Error while sending ticket email: ' + e.message });
    }
}

export { login, attend, ticketEmail, getVerifiedAttendee}