import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import Subject from '../models/Subject.js';
import { PDFService } from '../services/pdfService.js';

export const getDocumentsBySubject = async (req, res, next) => {
  try {
    const documents = await Document.find({
      subjectId: req.params.subjectId,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (err) {
    next(err);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.user._id,
    });
    if (!subject) {
      // Remove uploaded file if subject invalid
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Create Document record in UPLOADED/PROCESSING state
    const doc = await Document.create({
      userId: req.user._id,
      subjectId: subject._id,
      originalName: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      processingStatus: 'PROCESSING',
    });

    // Execute synchronous or immediate extraction
    try {
      const extractedText = await PDFService.extractText(req.file.path, req.file.mimetype);
      doc.extractedText = extractedText;
      doc.charCount = extractedText.length;
      doc.processingStatus = 'PROCESSED';
      doc.processedAt = new Date();
      await doc.save();
    } catch (parseErr) {
      doc.processingStatus = 'FAILED';
      doc.processingError = parseErr.message;
      await doc.save();
    }

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user._id,
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const retryProcessing = async (req, res, next) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user._id,
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const filePath = path.resolve('uploads', doc.storageKey);
    doc.processingStatus = 'PROCESSING';
    doc.processingError = null;
    await doc.save();

    try {
      const extractedText = await PDFService.extractText(filePath, doc.mimeType);
      doc.extractedText = extractedText;
      doc.charCount = extractedText.length;
      doc.processingStatus = 'PROCESSED';
      doc.processedAt = new Date();
      await doc.save();
    } catch (parseErr) {
      doc.processingStatus = 'FAILED';
      doc.processingError = parseErr.message;
      await doc.save();
    }

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.documentId,
      userId: req.user._id,
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Clean up file on disk
    const filePath = path.resolve('uploads', doc.storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: 'Document removed.' });
  } catch (err) {
    next(err);
  }
};
