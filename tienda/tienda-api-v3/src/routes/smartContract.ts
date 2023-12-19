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
            const transaction = EthereumService.prepareContractTransaction(method, args, publicAddress);
            res.send(transaction)
            return
        }
        if (signerType === 'owner') {
            // Manejar el método del contrato con el signerOwner
            result = await EthereumService.handleSmartContractMethod(method, args);
            result = ethers.formatEther(result);    
            res.send(result);
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }

});

// router.post('/withdraw', async (req: Request, res: Response) => {
//     try {
//         const contract = (req as any).contract;
//         console.log(req.body)
//         const respuestaBuffer = await contract.evaluateTransaction("getBurnAmount", ...(req.body.args || []));
//         const respuesta = JSON.parse(Buffer.from(respuestaBuffer).toString())
//         const amount = Number(respuesta.amount)
//         const to = respuesta.address
//         const tx = await EthereumService.handleSmartContractMethod('withdraw', [amount, to]);

//         console.log("<------- Withdrawn started ------>", tx)

//         const receipt = await tx.wait()

//         console.log("<------- Withdrawn receipt ------>", receipt)

//         if (receipt.status === 0) {
//             throw new Error("MATIC transaction failed")
//             return
//         }
//         //write in chaincode than money was paid

//         const responseBuffer = await contract.submitTransaction("registerWithdrawn", ...(req.body.args || []));
//         const responseString = Buffer.from(responseBuffer).toString();

//         res.send(responseString);
//     } catch (error) {
//         console.log(error)
//         res.status(400).send(error.message);
//     }

// });



export default router;
