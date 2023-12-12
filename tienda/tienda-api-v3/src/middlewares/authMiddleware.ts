import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { config } from '../config'
import { getUser } from '../utils/userUtils';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send('Access Denied: No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // req.user = decoded;
        // if(decoded && decoded.mspID != config.mspID) {
        //     res.status(401).send("EL usuario no partenece a esta organizacion")
        //     return
        // }

        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

// Tipado adicional para agregar la propiedad user al objeto Request
declare global {
    namespace Express {
        interface Request {
            user: any;
        }
    }
}