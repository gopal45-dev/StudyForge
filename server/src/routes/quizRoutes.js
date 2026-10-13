import express from 'express';
import {
  getQuizzes,
  getQuiz,
  submitAttempt,
  getAttempts,
  getAttempt,
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.get('/:quizId', getQuiz);
router.post('/:quizId/attempts', submitAttempt);

// Attempts history routes
router.get('/attempts/history', getAttempts);
router.get('/attempts/:attemptId', getAttempt);

export default router;
