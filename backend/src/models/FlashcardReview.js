import mongoose from 'mongoose';

const flashcardReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyResource',
      required: true,
      index: true,
    },
    cardId: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      enum: ['AGAIN', 'HARD', 'GOOD', 'EASY'],
      required: true,
    },
    intervalDays: {
      type: Number,
      default: 1,
    },
    nextReviewAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('FlashcardReview', flashcardReviewSchema);
