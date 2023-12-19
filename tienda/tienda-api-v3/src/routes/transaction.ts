import { Router, Request, Response } from 'express';
import TransactionService from '../services/TransactionService';
import EthereumService from '../services/EthereumService';

const router = Router();

router.post('/ping', TransactionService.ping);
router.post('/submit', TransactionService.submitTransaction);
router.post('/consult', TransactionService.consultTransaction);

export default router;