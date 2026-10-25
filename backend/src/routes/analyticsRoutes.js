import express from 'express';
import {
  getDashboardAnalytics,
  getTopicAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/topics', getTopicAnalytics);

export default router;
