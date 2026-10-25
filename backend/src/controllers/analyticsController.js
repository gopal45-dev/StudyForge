import Subject from '../models/Subject.js';
import Document from '../models/Document.js';
import QuizAttempt from '../models/QuizAttempt.js';
import TopicPerformance from '../models/TopicPerformance.js';
import RevisionTask from '../models/RevisionTask.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [subjectCount, documentCount, attempts, pendingTasks, topicStats] = await Promise.all([
      Subject.countDocuments({ userId }),
      Document.countDocuments({ userId }),
      QuizAttempt.find({ userId }).sort({ createdAt: -1 }).limit(10),
      RevisionTask.countDocuments({ userId, status: 'PENDING' }),
      TopicPerformance.find({ userId }).sort({ accuracy: 1 }),
    ]);

    // Calculate overall average accuracy from real attempts
    const totalAttemptedQuestions = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const totalCorrect = attempts.reduce((acc, curr) => acc + curr.correctCount, 0);
    const overallAccuracy = totalAttemptedQuestions > 0
      ? Math.round((totalCorrect / totalAttemptedQuestions) * 100)
      : 0;

    // Filter weak topics with empirical evidence (attempted >= 3, accuracy < 60%)
    const weakTopics = topicStats
      .filter(t => t.attemptedCount >= 3 && t.accuracy < 60)
      .slice(0, 5)
      .map(t => ({
        topicTag: t.topicTag,
        accuracy: t.accuracy,
        attemptedCount: t.attemptedCount,
        subjectId: t.subjectId,
        status: 'Needs Immediate Review',
      }));

    // Filter topics with insufficient data
    const insufficientEvidenceTopics = topicStats
      .filter(t => t.attemptedCount < 3)
      .map(t => ({
        topicTag: t.topicTag,
        attemptedCount: t.attemptedCount,
        status: 'Insufficient Evidence (< 3 questions)',
      }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          subjectCount,
          documentCount,
          attemptsCount: attempts.length,
          pendingTasks,
          overallAccuracy,
        },
        recentAttempts: attempts.slice(0, 5),
        weakTopics,
        insufficientEvidenceTopics,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTopicAnalytics = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    const topics = await TopicPerformance.find(filter)
      .populate('subjectId', 'name colorCode')
      .sort({ accuracy: 1 });

    res.status(200).json({ success: true, count: topics.length, data: topics });
  } catch (err) {
    next(err);
  }
};
