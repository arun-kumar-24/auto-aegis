import express from 'express';
import {
    createMonitor,
    getMonitors,
    getMonitorById,
    updateMonitor,
    deleteMonitor,
    rotateApiKey
} from '../controllers/monitorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all monitor routes
router.use(authenticateToken);

router.post('/', createMonitor);
router.get('/', getMonitors);
router.get('/:id', getMonitorById);
router.patch('/:id', updateMonitor);
router.delete('/:id', deleteMonitor);
router.post('/:id/rotate-key', rotateApiKey);

export default router;
