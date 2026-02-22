import express from 'express';
import { sendSlackAlert } from '../controllers/slackController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/slack', sendSlackAlert);

export default router;
