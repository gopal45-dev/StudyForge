import express from 'express';
import {
  getDocument,
  retryProcessing,
  deleteDocument,
} from '../controllers/documentController.js';
import {
  generateSummary,
  generateFlashcards,
} from '../controllers/resourceController.js';
import { generateQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/:documentId')
  .get(getDocument)
  .delete(deleteDocument);

router.post('/:documentId/retry-processing', retryProcessing);
router.post('/:documentId/generate-summary', generateSummary);
router.post('/:documentId/generate-flashcards', generateFlashcards);
router.post('/:documentId/generate-quiz', generateQuiz);

export default router;
