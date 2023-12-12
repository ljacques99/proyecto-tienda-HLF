import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

interface JwtPayload {
    walletAddress: string;
    username: string;
    mspID: string;
}

export const createSignUpToken = (payload: object, expiresIn: string | number = '1h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const createToken = (payload: object, expiresIn: string | number = '48h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: any) : JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
        throw new Error('Invalid token');
    }
};
