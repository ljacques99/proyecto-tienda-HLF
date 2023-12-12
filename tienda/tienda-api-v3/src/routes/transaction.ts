import { Router } from 'express';
import TransactionService from '../services/TransactionService';

const router = Router();

router.post('/ping', TransactionService.ping);
router.post('/submit', TransactionService.submitTransaction);
router.get('/consult', TransactionService.consultTransaction);

export default router;