import { Router } from 'express';
import TransactionService from '../services/TransactionService';

const router = Router();

router.post('/ping', TransactionService.ping);
router.post('/submit', TransactionService.submitTransaction);
router.post('/consult', TransactionService.consultTransaction);

export default router;