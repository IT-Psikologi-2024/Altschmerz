import { Request, Response } from 'express';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { generateJWT } from '../utils/jwtGenerator';

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
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === attendeeId && verified[i] === "Iya") {
                rowNumber = i + 1
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

export { login, attend }