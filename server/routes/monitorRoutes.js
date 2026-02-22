import express from 'express';
import {
    createMonitor,
    getMonitors,
    getMonitorById,
    updateMonitor,
    deleteMonitor,
    rotateApiKey,
    getMonitorLogs,
    getMonitorResults,
    getMonitorStats
} from '../controllers/monitorController.js';
import { getLatestJourneyFiles } from '../controllers/journeyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all monitor routes
router.use(authenticateToken);

router.post('/', createMonitor);
router.get('/', getMonitors);
router.get('/:id', getMonitorById);
router.get('/:id/logs', getMonitorLogs);
router.get('/:id/results', getMonitorResults);
router.get('/:id/stats', getMonitorStats);
router.get('/:id/journey-files', getLatestJourneyFiles);
router.patch('/:id', updateMonitor);
router.delete('/:id', deleteMonitor);
router.post('/:id/rotate-key', rotateApiKey);

export default router;
