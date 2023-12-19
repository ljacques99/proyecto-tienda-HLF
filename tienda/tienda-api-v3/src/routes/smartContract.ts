import { Router, Request, Response } from 'express';
import EthereumService from '../services/EthereumService';
import { ethers, BigNumberish } from 'ethers';

const router = Router();

router.post('/bridge/:walletAddress', async (req: Request, res: Response) => {
    try {
        const { method, args, signerType } = req.body;
        const publicAddress = req.params.walletAddress

        let result;

        if (signerType === 'public') {
            // Preparar los datos de la transacción para la firma en el cliente
            result = EthereumService.prepareContractTransaction(method, args, publicAddress);
        }
        if (signerType === 'owner') {
            // Manejar el método del contrato con el signerOwner
            result = await EthereumService.handleSmartContractMethod(method, args);
        }

        if (result) {
            result = ethers.formatEther(result);
        }

        res.send(result);
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }

});

export default router;
