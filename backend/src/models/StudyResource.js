import mongoose from 'mongoose';

const studyResourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['SUMMARY', 'FLASHCARDS'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    // Structured content based on resourceType:
    // SUMMARY: { overview, keyPoints: [], definitions: [{ term, definition }], formulas: [] }
    // FLASHCARDS: { cards: [{ id, front, back, topicTag, difficulty }] }
    structuredContent: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sourceReferences: [
      {
        section: String,
        excerpt: String,
      },
    ],
    generationStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },
  },
  { timestamps: true }
);

export default mongoose.model('StudyResource', studyResourceSchema);
