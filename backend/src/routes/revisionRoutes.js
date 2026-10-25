import express from 'express';
import {
  getRevisionTasks,
  createRevisionTask,
  updateRevisionTask,
  deleteRevisionTask,
  generateRecommendations,
} from '../controllers/revisionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRevisionTasks)
  .post(createRevisionTask);

router.post('/generate-recommendations', generateRecommendations);

router.route('/:taskId')
  .patch(updateRevisionTask)
  .delete(deleteRevisionTask);

export default router;
