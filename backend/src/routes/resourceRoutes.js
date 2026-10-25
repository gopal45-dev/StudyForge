import express from 'express';
import {
  getResources,
  getResource,
  recordCardReview,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResources);

router.route('/:resourceId')
  .get(getResource)
  .delete(deleteResource);

router.post('/:resourceId/reviews', recordCardReview);

export default router;
