import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { connectGateway } from '../utils/gatewayUtils';

export async function gatewayMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const contractNameHeader = req.headers['x-contract-name'] as string;
        const isAdminHeader = req.headers['x-admin'] as string
        
        if (!contractNameHeader) {
            return res.status(400).send('Contract name is required');
        }

        const isAdmin = isAdminHeader === 'true';

        (req as any).contract = await connectGateway(req.user.username, contractNameHeader, isAdmin)
        next()

    } catch (error) {
        res.status(400).send(error);
    }
}

// export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
//     try {
//         const authHeader = req.headers.authorization;
//         const contractNameHeader = req.headers['x-contract-name'] as string;
//         if (!authHeader) {
//             return res.status(401).send('Access Denied: No token provided');
//         }

//         const token = authHeader.split(' ')[0]; // [1] if Auth = Bearer eYJhb....
//         const decoded = verifyToken(token);
//         // const decoded = jwtDecode(token)

//         if (!decoded || !decoded.walletAddress) {
//             return res.status(401).send('Invalid token');
//         }
        
//         if (!contractNameHeader) {
//             return res.status(400).send('Contract name is required');
//         } 


//         (req as any).contract = await connectGateway(decoded.username, contractNameHeader)

//         next()

//     } catch (error) {
//         res.status(400).send(error);
//     }
// }

// Tipado adicional para agregar la propiedad user al objeto Request
declare global {
    namespace Express {
        interface Request {
            user: any;
        }
    }
}