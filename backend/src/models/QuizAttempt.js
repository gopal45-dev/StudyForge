import mongoose from 'mongoose';

const responseItemSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedIndex: { type: Number, default: -1 }, // -1 for skipped
  correctIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  topicTag: { type: String, required: true },
  explanation: { type: String, required: true },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    responses: [responseItemSchema],
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    skippedCount: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('QuizAttempt', quizAttemptSchema);
