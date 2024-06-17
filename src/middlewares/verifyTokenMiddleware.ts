require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY

        let token = req.headers.authorization
    
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token not found' });
        }

        token = token.split(' ')[1];
        
        jwt.verify(token, accessSecretKey);

        next();
    } catch (e) {
        console.error('Error while verifying token:', e.message);
        return res.status(401).json({ error: 'Unauthorized: ' + e.message });
    }
};

export { verifyToken }