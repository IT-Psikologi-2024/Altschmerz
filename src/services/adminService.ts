import { Request, Response } from 'express';
import { generateJWT } from '../utils/jwtGenerator';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { gmailSend } from './googleServices/gmailService';

const attend = async (req: Request, res: Response) => {
    try {
        const attendeeId = req.params.id

        const ids = await sheetGet('Ticket!A1:A1000')
        const idList = ids.map((id : any) => id[0])

        let rowNumber = 0;
        for (let index = 0; index < idList.length; index++) {
            if (idList[index] === attendeeId) {
                rowNumber = index + 1
                break;
            }
        }

        if (rowNumber === 0) {
            res.status(401).json({error : "Attendee was not found"});
            return;
        }

        await sheetUpdate('Iya', `Ticket!M${rowNumber}`)

        const name = await sheetGet(`Ticket!B${rowNumber}`)
        const nameString = name[0][0]

        res.status(200).json({message : nameString});
    } catch (e) {
        console.error('Error while attending:', e.message);
        res.status(500).json({ error: 'Error while attending: ' + e.message });
    }
};

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

const ticketEmail = async (req: Request, res: Response) => {
    try {
        const sheetData = await sheetGet('Ticket!A1:L1000');
        
        const ids = sheetData.map((row : string[])=> row[0]);
        const names = sheetData.map((row : string[])=> row[1]);
        const emails = sheetData.map((row : string[])=> row[4]);
        const verified = sheetData.map((row : string[])=> row[10]);
        const emailStatus = sheetData.map((row : string[])=> row[11]);

        for (let index = 1; index < ids.length; index++) {
            const id = ids[index];
            const name = names[index];
            const email = emails[index];
            const isVerified = verified[index] === "Iya";
            const isPending = emailStatus[index] === "Pending";

            if (isVerified && isPending) {
                console.log("Sending to: " + email);
                await gmailSend(id, name, email);
                await sheetUpdate('Terkirim', `Ticket!L${index + 1}`);
            }
        }

        res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error('Error while sending ticket email:', e.message);
        res.status(500).json({ error: 'Error while sending ticket email: ' + e.message });
    }
}



export { login, attend, ticketEmail}