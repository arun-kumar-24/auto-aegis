import express from 'express';
import { ingestJourney, ingestSynthetic } from '../controllers/ingestController.js';
import { validateApiKey } from '../middleware/validateApiKey.js';

const router = express.Router();

// All ingestion routes require a valid API key header
router.use(validateApiKey);

router.post('/journey', ingestJourney);
router.post('/synthetic', ingestSynthetic);

export default router;
