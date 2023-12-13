import { Request, Response } from 'express';

class TransactionService {
    static async ping(req: Request, res: Response) {
        try {
            const contract = (req as any).contract;

            if (!contract) {
                throw new Error('Contract not found');
            }

            const responseBuffer = await contract.evaluateTransaction("Ping");
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400).send(e.details && e.details.length ? e.details : e.message);
        }
    }
    static async consultTransaction(req: Request, res: Response) {
        try {
            const { fcn, args } = req.body;
            const contract = (req as any).contract;

            if (!contract) {
                throw new Error('Contract not found');
            }

            const responseBuffer = await contract.evaluateTransaction(fcn, ...args || []);
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400).send(e.details && e.details.length ? e.details : e.message);
        }
    }

    static async submitTransaction(req: Request, res: Response) {
        try {
            const { fcn, args } = req.body;
            const contract = (req as any).contract;

            if (!contract) {
                throw new Error('Contract not found');
            }

            const responseBuffer = await contract.submitTransaction(fcn, ...args || []);
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400).send(e.details && e.details.length ? e.details : e.message);
        }
    }
}

export default TransactionService;