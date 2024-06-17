import { Request, Response } from 'express';
import { sheetGet, sheetUpdate } from './googleServices/sheetService';
import { generateJWT } from '../utils/jwtGenerator';
import jwt from 'jsonwebtoken'

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
        const { accessToken, refreshToken } = generateJWT(userId)
            
        res.status(200).send({message:"Logged in succesfully", accessToken, refreshToken})
    } catch (e) {
        console.error('Error while logging in:', e.message);
        res.status(500).json({ error: 'Error while logging in: ' + e.message });
    }
};

const refresh = async (req: Request, res: Response) => {
    try {   
        const refreshToken = req.body.refreshToken
        const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY

        if (!refreshToken) {
            return res.status(401).json({ error: 'Unauthorized: Refresh token not found' });
        }

        jwt.verify(refreshToken, refreshSecretKey)

        const userId = process.env.ADMIN_ID
        const { accessToken } = generateJWT(userId)
            
        res.status(200).send({ message:"Access token refreshed", accessToken })
    } catch (e) {
        console.error('Error while refreshing access token:', e.message);
        res.status(500).json({ error: 'Error while refreshing access token: ' + e.message });
    }
};

const attend = async (req: Request, res: Response) => {
    try {
        const attendeeId = req.params.id

        const sheetData = await sheetGet('Ticket!A1:P1000')
        const ids = sheetData.map((id : string[]) => id[0])
        const names = sheetData.map((id : string[]) => id[1])
        const verified = sheetData.map((row : string[]) => row[13]);

        let rowNumber = 0;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === attendeeId && verified[i] === "Iya") {
                rowNumber = i + 1
                break;
            }
        }

        if (rowNumber === 0) {
            res.status(401).json({error : "Attendee not registered or verified"});
            return;
        }

        const name = names[rowNumber]

        await sheetUpdate('Iya', `Ticket!P${rowNumber}`)

        res.status(200).json({message : name});
    } catch (e) {
        console.error('Error while attending:', e.message);
        res.status(500).json({ error: 'Error while attending: ' + e.message });
    }
};

export { login, refresh, attend }