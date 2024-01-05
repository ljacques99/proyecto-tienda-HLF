import { Router, Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { verifyAddressMiddleware } from '../middlewares/verifyAddressMiddleware'

const router = Router();

router.post('/wallet', async (req: Request, res: Response) => {
    try {
        console.log("body", req.body)
        const { walletAddress } = req.body;
        const result = await AuthService.verifyAddressAuthority(walletAddress);
        res.send(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/signup', verifyAddressMiddleware, async (req: Request, res: Response) => {
    try {
        console.log("point13")
        const { username, email, walletAddress } = req.body;
        const result = await AuthService.signUpWithWallet(username, email, walletAddress);
        res.send(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// router.post('/login', async (req: Request, res: Response) => {
//     try {
//         const { username, password } = req.body;
//         const result = await AuthService.login(username, password);
//         res.json(result);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

router.post('/loginV2', async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.body;
        const result = await AuthService.loginWithAddress(walletAddress);
        res.json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

export default router;