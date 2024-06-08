import { Request, Response } from 'express';
import { generateJWT } from '../utils/jwtGenerator';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';

const attend = async (req: Request, res: Response) => {
    try {
        const attendeeId = req.params.id

        const ids = await sheetGet('Ticket!A1:A1000')
        const idList = ids.data.values.map((id : any) => id[0])

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

        await sheetUpdate('Hadir', `Ticket!K${rowNumber}`)

        res.status(200).json({message : "Attendance Success"});
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


export { login, attend}