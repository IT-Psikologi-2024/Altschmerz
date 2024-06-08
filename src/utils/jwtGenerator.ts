import jwt from 'jsonwebtoken';

const generateJWT = (userId: string) => {

    const SECRET_KEY = process.env.JWT_SECRET_KEY;

    const payload = {
        userId: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };

    const jwtToken = jwt.sign(payload, SECRET_KEY);
    return jwtToken;
}

export  { generateJWT }