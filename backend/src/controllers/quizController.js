import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Document from '../models/Document.js';
import TopicPerformance from '../models/TopicPerformance.js';
import { AIService } from '../services/aiService.js';

export const generateQuiz = async (req, res, next) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user._id,
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    if (doc.processingStatus !== 'PROCESSED' || !doc.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'Document text is not yet processed or extraction failed.',
      });
    }

    // Check if quiz already exists for this document
    const existingQuiz = await Quiz.findOne({
      userId: req.user._id,
      documentId: doc._id,
    });
    if (existingQuiz) {
      return res.status(200).json({
        success: true,
        message: 'A practice quiz already exists for this document.',
        data: existingQuiz,
      });
    }

    const quizData = await AIService.generateQuiz(doc.extractedText, 5);
    const topicTags = [...new Set(quizData.questions.map(q => q.topicTag))];

    const quiz = await Quiz.create({
      userId: req.user._id,
      subjectId: doc.subjectId,
      documentId: doc._id,
      title: `Practice Assessment: ${doc.originalName}`,
      questions: quizData.questions,
      topicTags,
      difficulty: 'MIXED',
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const getQuizzes = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    const quizzes = await Quiz.find(filter)
      .populate('subjectId', 'name colorCode')
      .populate('documentId', 'originalName')
      .select('-questions.correctIndex -questions.explanation') // Keep answers hidden in list
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (err) {
    next(err);
  }
};

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    })
      .populate('subjectId', 'name colorCode')
      .populate('documentId', 'originalName');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // CRITICAL SECURITY RULE: Strip correctIndex and explanation before serving quiz
    const safeQuiz = quiz.toObject();
    safeQuiz.questions = safeQuiz.questions.map(q => ({
      id: q.id || q._id,
      question: q.question,
      options: q.options,
      topicTag: q.topicTag,
      difficulty: q.difficulty,
    }));

    res.status(200).json({ success: true, data: safeQuiz });
  } catch (err) {
    next(err);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const { answers, timeSpentSeconds } = req.body; // answers: [{ questionId, selectedIndex }]
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers payload array is required.' });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const evaluatedResponses = [];

    // Map answers for instant lookup
    const answersMap = new Map();
    answers.forEach(a => answersMap.set(String(a.questionId), a.selectedIndex));

    // Topic updates accumulator
    const topicDelta = {};

    quiz.questions.forEach(q => {
      const qId = String(q.id || q._id);
      const selectedIndex = answersMap.has(qId) ? answersMap.get(qId) : -1;
      const isCorrect = selectedIndex === q.correctIndex;

      if (selectedIndex === -1 || selectedIndex === null) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      evaluatedResponses.push({
        questionId: qId,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        topicTag: q.topicTag,
        explanation: q.explanation,
      });

      // Accumulate topic performance
      if (!topicDelta[q.topicTag]) {
        topicDelta[q.topicTag] = { attempted: 0, correct: 0, incorrect: 0 };
      }
      if (selectedIndex !== -1) {
        topicDelta[q.topicTag].attempted++;
        if (isCorrect) {
          topicDelta[q.topicTag].correct++;
        } else {
          topicDelta[q.topicTag].incorrect++;
        }
      }
    });

    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      subjectId: quiz.subjectId,
      responses: evaluatedResponses,
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      scorePercentage,
      timeSpentSeconds: timeSpentSeconds || 0,
    });

    // Update TopicPerformance aggregates in database
    for (const [topicTag, delta] of Object.entries(topicDelta)) {
      if (delta.attempted > 0) {
        const perf = await TopicPerformance.findOne({
          userId: req.user._id,
          subjectId: quiz.subjectId,
          topicTag,
        });

        if (perf) {
          perf.attemptedCount += delta.attempted;
          perf.correctCount += delta.correct;
          perf.incorrectCount += delta.incorrect;
          perf.accuracy = Math.round((perf.correctCount / perf.attemptedCount) * 100);
          perf.lastAttemptAt = new Date();
          await perf.save();
        } else {
          await TopicPerformance.create({
            userId: req.user._id,
            subjectId: quiz.subjectId,
            topicTag,
            attemptedCount: delta.attempted,
            correctCount: delta.correct,
            incorrectCount: delta.incorrect,
            accuracy: Math.round((delta.correct / delta.attempted) * 100),
            lastAttemptAt: new Date(),
          });
        }
      }
    }

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

export const getAttempts = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.quizId) filter.quizId = req.query.quizId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    const attempts = await QuizAttempt.find(filter)
      .populate('quizId', 'title')
      .populate('subjectId', 'name colorCode')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (err) {
    next(err);
  }
};

export const getAttempt = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user._id,
    })
      .populate('quizId', 'title questions')
      .populate('subjectId', 'name colorCode');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }
    res.status(200).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.quizId,
      userId: req.user._id,
    });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }
    await QuizAttempt.deleteMany({ quizId: quiz._id });
    res.status(200).json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
