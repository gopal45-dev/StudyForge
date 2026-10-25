import fs from 'fs';
import pdfParse from 'pdf-parse';

export class PDFService {
  /**
   * Safely extracts text from an uploaded file (PDF or TXT)
   */
  static async extractText(filePath, mimeType) {
    if (!fs.existsSync(filePath)) {
      throw new Error('Target document file not found on disk.');
    }

    if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
      const text = fs.readFileSync(filePath, 'utf-8');
      if (!text || text.trim().length === 0) {
        throw new Error('The text file is empty. Please provide content to process.');
      }
      return text.trim();
    }

    // PDF extraction
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const data = await pdfParse(dataBuffer);
      const text = (data.text || '').trim();

      if (!text || text.length < 50) {
        throw new Error(
          'Document contains unreadable or insufficient text. Scanned PDFs without OCR are not supported.'
        );
      }

      return text;
    } catch (err) {
      if (err.message.includes('Scanned PDFs')) throw err;
      throw new Error(`Failed to parse PDF document structure: ${err.message}`);
    }
  }
}
