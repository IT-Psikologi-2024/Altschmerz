import jwt from 'jsonwebtoken';

const generateJWT = (userId: string) => {
    
    const accessSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    const payload = {
        userId: userId
    };

    const accessToken = jwt.sign(payload, accessSecretKey, {expiresIn : '15m'});
    const refreshToken = jwt.sign(payload, refreshSecretKey, {expiresIn : '30d'});
    return { accessToken, refreshToken };
}

export  { generateJWT }