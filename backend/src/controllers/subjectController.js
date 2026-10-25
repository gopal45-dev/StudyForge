import Subject from '../models/Subject.js';
import Document from '../models/Document.js';
import StudyResource from '../models/StudyResource.js';
import Quiz from '../models/Quiz.js';

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, description, colorCode, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a subject name.' });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      description,
      colorCode: colorCode || '#4f46e5',
      icon: icon || 'BookOpen',
    });

    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

export const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Include counts for documents and resources
    const docCount = await Document.countDocuments({ subjectId: subject._id, userId: req.user._id });
    const resourceCount = await StudyResource.countDocuments({ subjectId: subject._id, userId: req.user._id });
    const quizCount = await Quiz.countDocuments({ subjectId: subject._id, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        ...subject.toObject(),
        stats: { docCount, resourceCount, quizCount },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.subjectId, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.subjectId,
      userId: req.user._id,
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Cascade delete linked documents & resources
    await Document.deleteMany({ subjectId: subject._id });
    await StudyResource.deleteMany({ subjectId: subject._id });
    await Quiz.deleteMany({ subjectId: subject._id });

    res.status(200).json({ success: true, message: 'Subject and related assets deleted.' });
  } catch (err) {
    next(err);
  }
};
