import Document from '../models/Document.js';
import StudyResource from '../models/StudyResource.js';
import FlashcardReview from '../models/FlashcardReview.js';
import { AIService } from '../services/aiService.js';

export const generateSummary = async (req, res, next) => {
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

    const summaryData = await AIService.generateSummary(doc.extractedText, doc.originalName);

    const resource = await StudyResource.create({
      userId: req.user._id,
      subjectId: doc.subjectId,
      documentId: doc._id,
      resourceType: 'SUMMARY',
      title: summaryData.title || `Summary: ${doc.originalName}`,
      structuredContent: summaryData,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

export const generateFlashcards = async (req, res, next) => {
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

    const flashcardsData = await AIService.generateFlashcards(doc.extractedText);

    const resource = await StudyResource.create({
      userId: req.user._id,
      subjectId: doc.subjectId,
      documentId: doc._id,
      resourceType: 'FLASHCARDS',
      title: `Flashcards: ${doc.originalName}`,
      structuredContent: flashcardsData,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

export const getResources = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.type) filter.resourceType = req.query.type;

    const resources = await StudyResource.find(filter)
      .populate('subjectId', 'name colorCode')
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    next(err);
  }
};

export const getResource = async (req, res, next) => {
  try {
    const resource = await StudyResource.findOne({
      _id: req.params.resourceId,
      userId: req.user._id,
    })
      .populate('subjectId', 'name colorCode')
      .populate('documentId', 'originalName');

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

export const recordCardReview = async (req, res, next) => {
  try {
    const { cardId, rating } = req.body;
    if (!cardId || !rating) {
      return res.status(400).json({ success: false, message: 'cardId and rating are required.' });
    }

    // Spaced repetition scheduling intervals
    const intervalMap = {
      AGAIN: 1, // Repeat in 1 day
      HARD: 2,  // Repeat in 2 days
      GOOD: 4,  // Repeat in 4 days
      EASY: 7,  // Repeat in 7 days
    };

    const intervalDays = intervalMap[rating] || 1;
    const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

    const review = await FlashcardReview.create({
      userId: req.user._id,
      resourceId: req.params.resourceId,
      cardId,
      rating,
      intervalDays,
      nextReviewAt,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const resource = await StudyResource.findOneAndDelete({
      _id: req.params.resourceId,
      userId: req.user._id,
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    res.status(200).json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
};
