import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { connectGateway } from '../utils/gatewayUtils';
import { jwtDecode } from 'jwt-decode';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send('Access Denied: No token provided');
        }

        const token = authHeader.split(' ')[0]; // [1] if Auth = Bearer eYJhb....
        //const decoded = verifyToken(token);
        const decoded = jwtDecode(token)

        if (!decoded) {
            return res.status(401).send('Invalid token');
        }

        req.user = decoded

        next()

    } catch (error) {
        res.status(400).send(error);
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