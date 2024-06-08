require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.authorization
    
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token not found' });
        }

        token = token.split(' ')[1];
        const secretKey = process.env.JWT_SECRET_KEY
    
        jwt.verify(token, secretKey) as { [key: string]: any };

        next();
    } catch (e) {
        console.error('Error while verifying token:', e.message);
        return res.status(401).json({ error: 'Unauthorized: ' + e.message });
    }
};

export { verifyToken }