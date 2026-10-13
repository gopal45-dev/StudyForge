import express from 'express';
import {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import {
  getDocumentsBySubject,
  uploadDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(createSubject);

router.route('/:subjectId')
  .get(getSubject)
  .patch(updateSubject)
  .delete(deleteSubject);

// Nested routes for subject documents
router.route('/:subjectId/documents')
  .get(getDocumentsBySubject)
  .post(upload.single('file'), uploadDocument);

export default router;
