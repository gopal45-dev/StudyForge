import RevisionTask from '../models/RevisionTask.js';
import TopicPerformance from '../models/TopicPerformance.js';

export const getRevisionTasks = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    const tasks = await RevisionTask.find(filter)
      .populate('subjectId', 'name colorCode')
      .sort({ priority: 1, dueDate: 1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const createRevisionTask = async (req, res, next) => {
  try {
    const { subjectId, topicTag, title, description, priority, dueDate } = req.body;
    if (!subjectId || !topicTag || !title) {
      return res.status(400).json({
        success: false,
        message: 'subjectId, topicTag, and title are required.',
      });
    }

    const task = await RevisionTask.create({
      userId: req.user._id,
      subjectId,
      topicTag,
      title,
      description,
      priority: priority || 'MEDIUM',
      dueDate: dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const updateRevisionTask = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'COMPLETED' && !updates.completedAt) {
      updates.completedAt = new Date();
    } else if (updates.status === 'PENDING') {
      updates.completedAt = null;
    }

    const task = await RevisionTask.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Revision task not found.' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const deleteRevisionTask = async (req, res, next) => {
  try {
    const task = await RevisionTask.findOneAndDelete({
      _id: req.params.taskId,
      userId: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Revision task not found.' });
    }
    res.status(200).json({ success: true, message: 'Revision task removed.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Automatically inspects real quiz history and generates deduplicated revision tasks
 */
export const generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all topics where attempted >= 3 and accuracy < 65%
    const weakTopics = await TopicPerformance.find({
      userId,
      attemptedCount: { $gte: 3 },
      accuracy: { $lt: 65 },
    }).populate('subjectId', 'name');

    const createdTasks = [];

    for (const item of weakTopics) {
      const recKey = `${userId}_${item.subjectId._id}_${item.topicTag.replace(/\s+/g, '_').toLowerCase()}`;

      // Check if an existing pending task with this key already exists
      const existing = await RevisionTask.findOne({
        userId,
        recommendationKey: recKey,
        status: 'PENDING',
      });

      if (!existing) {
        const priority = item.accuracy < 40 ? 'HIGH' : 'MEDIUM';
        const reason = `Detected ${item.accuracy}% accuracy across ${item.attemptedCount} attempted practice questions.`;

        const newTask = await RevisionTask.create({
          userId,
          subjectId: item.subjectId._id,
          topicTag: item.topicTag,
          title: `Revise: ${item.topicTag} (${item.subjectId.name})`,
          description: `Focused review recommended to close knowledge gap in "${item.topicTag}". ${reason}`,
          priority,
          reason,
          recommendationKey: recKey,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

        createdTasks.push(newTask);
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${createdTasks.length} new revision recommendations.`,
      data: createdTasks,
    });
  } catch (err) {
    next(err);
  }
};
