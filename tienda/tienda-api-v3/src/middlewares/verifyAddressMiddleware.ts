import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { verifyToken } from '../utils/jwtUtils'; // Asegúrate de que esta importación sea correcta
import { jwtDecode } from "jwt-decode"

export function verifyAddressMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { walletAddress } = req.body;
        const authorizationHeader = req.headers.authorization || '';
        const tokenParts = authorizationHeader.split(' ');
        const jwt = tokenParts.length > 1 ? tokenParts[1] : null;

        if (!jwt) {
            return res.status(401).send('Unauthorized request');
        }

        // Verificar que el token fue emitido por el servidor
        const decodedToken = jwtDecode(jwt)        
        const serverToken = verifyToken(decodedToken)

        if (!decodedToken || !serverToken) {
            return res.status(401).send('Invalid authorization');
        }

        const jwtSegments = jwt.split('.');
        if (jwtSegments.length !== 3) {
            return res.status(401).send('Invalid token format');
        }

        const signature = jwtSegments[2];
        const message = jwtSegments[0] + '.' + jwtSegments[1]; // Header y Payload del JWT

        // Verificar la firma
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // Comprobar si la dirección recuperada coincide con la dirección de la wallet
        if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase() && recoveredAddress.toLowerCase() === serverToken.walletAddress.toLowerCase()) {
            next();
        } else {
            res.status(401).send('Invalid signature');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Error verifying signature');
    }
}