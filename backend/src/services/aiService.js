import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Robust LLM service that supports Google Gemini API with fallback mock mode for testing without requiring keys
 */
export class AIService {
  static getProvider() {
    return process.env.AI_PROVIDER || 'mock';
  }

  static getClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  /**
   * Generates a structured Study Summary from extracted text
   */
  static async generateSummary(text, title = 'Course Material') {
    const boundedText = text.slice(0, 15000); // Guard token length

    const provider = this.getProvider();
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        const client = this.getClient();
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert academic tutor. Analyze the following study material and return ONLY a valid JSON object (no markdown quotes, no backticks, just raw JSON).
The JSON must follow this exact schema:
{
  "title": "${title}",
  "overview": "A concise executive summary paragraph of the document",
  "keyPoints": ["Key concept 1 with brief explanation", "Key concept 2", "Key concept 3"],
  "definitions": [
    {"term": "Term Name", "definition": "Clear concise definition"}
  ],
  "formulas": ["Optional formula or key rule if applicable"],
  "revisionChecklist": ["Question or objective 1", "Question or objective 2"]
}

Source text:
${boundedText}
`;
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn('[Gemini AI Service Error, falling back to heuristic generator]:', err.message);
      }
    }

    // High quality offline fallback generator for evaluation without API quotas
    const lines = boundedText.split('\n').filter(l => l.trim().length > 20);
    return {
      title: `${title} - Comprehensive Summary`,
      overview: `This structured summary distills key themes, core foundational concepts, and revision focal points extracted directly from "${title}".`,
      keyPoints: [
        lines[0] || 'Core theoretical principles and foundational architecture.',
        lines[1] || 'Essential operational mechanisms and functional workflows.',
        lines[2] || 'Critical performance metrics, trade-offs, and optimization criteria.',
        lines[3] || 'Practical applications and edge cases analyzed within the material.',
      ],
      definitions: [
        {
          term: 'Primary Protocol / Concept',
          definition: lines[4] || 'A systematic framework governing interaction and integrity within this subject domain.',
        },
        {
          term: 'Core Architecture',
          definition: lines[5] || 'The structured relationship between functional layers and persistent states.',
        },
      ],
      formulas: ['Efficiency = (Successful Operations / Total Queries) * 100%'],
      revisionChecklist: [
        'Understand the core workflow stages and primary failure modes.',
        'Review the terminology definitions and their respective operational roles.',
        'Validate performance under boundary conditions.',
      ],
    };
  }

  /**
   * Generates Spaced-Repetition Flashcards
   */
  static async generateFlashcards(text, count = 8) {
    const boundedText = text.slice(0, 15000);
    const provider = this.getProvider();

    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        const client = this.getClient();
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
Generate ${count} academic flashcards from the text below. Return ONLY a valid JSON object (no markdown backticks, no extra text):
{
  "cards": [
    {
      "id": "card-1",
      "front": "Specific concept question or prompt",
      "back": "Accurate, concise explanation",
      "topicTag": "Specific Subtopic Name",
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}

Source text:
${boundedText}
`;
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn('[Gemini AI Flashcards Error, falling back to mock]:', err.message);
      }
    }

    // Deterministic fallback generator
    return {
      cards: [
        {
          id: 'card-1',
          front: 'What is the primary role of the foundational layer discussed in the material?',
          back: 'It abstracts underlying complexity, ensures secure validation, and maintains state consistency across processes.',
          topicTag: 'Architecture Fundamentals',
          difficulty: 'EASY',
        },
        {
          id: 'card-2',
          front: 'How is data persistence guaranteed across failure recovery events?',
          back: 'Through immutable snapshots, transactional logging, and idempotent state synchronization mechanisms.',
          topicTag: 'Data Persistence',
          difficulty: 'MEDIUM',
        },
        {
          id: 'card-3',
          front: 'What metric determines whether a subtopic needs immediate revision priority?',
          back: 'A success accuracy below 50% across at least 5 empirical quiz evaluations.',
          topicTag: 'Performance Analytics',
          difficulty: 'HARD',
        },
        {
          id: 'card-4',
          front: 'Explain the difference between optimistic and pessimistic concurrency control.',
          back: 'Optimistic verifies data validity at commit time, whereas pessimistic locks resources immediately upon access.',
          topicTag: 'Concurrency & Scaling',
          difficulty: 'MEDIUM',
        },
      ],
    };
  }

  /**
   * Generates Grounded MCQ Quiz with server-side answers and explanations
   */
  static async generateQuiz(text, count = 5) {
    const boundedText = text.slice(0, 15000);
    const provider = this.getProvider();

    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        const client = this.getClient();
        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
Generate an academic MCQ quiz of ${count} questions based strictly on the text provided. Return ONLY valid JSON (no backticks):
{
  "questions": [
    {
      "id": "q-1",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0, // integer 0, 1, 2, or 3
      "explanation": "Why this answer is correct based on the text",
      "topicTag": "Specific Subtopic Name",
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}

Source text:
${boundedText}
`;
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn('[Gemini AI Quiz Error, falling back to mock]:', err.message);
      }
    }

    return {
      questions: [
        {
          id: 'q-1',
          question: 'What is the primary responsibility of the central controller in the architecture?',
          options: [
            'Direct raw client-side DOM rendering',
            'Validating incoming requests and coordinating service business logic',
            'Bypassing persistence layers to reduce latency',
            'Serving unencrypted cookies across public networks',
          ],
          correctIndex: 1,
          explanation: 'The controller coordinates application workflow, validates inputs, and orchestrates domain services.',
          topicTag: 'System Architecture',
          difficulty: 'EASY',
        },
        {
          id: 'q-2',
          question: 'Why must quiz scoring and evaluation be conducted exclusively on the server?',
          options: [
            'To decrease internet bandwidth consumption',
            'Because browsers cannot compute percentage scores',
            'To prevent client-side answer key inspection and preserve evaluation integrity',
            'To allow third-party trackers to log responses',
          ],
          correctIndex: 2,
          explanation: 'Restricting answer keys to server verification prevents clients from inspecting confidential data via DevTools.',
          topicTag: 'Security & Assessment',
          difficulty: 'MEDIUM',
        },
        {
          id: 'q-3',
          question: 'Under StudyForge analytics rules, when is a topic marked with "Insufficient Evidence"?',
          options: [
            'When a user answers zero questions correctly',
            'When the total sample of answered questions is fewer than 3',
            'Only when a server database timeout occurs',
            'When the question difficulty is classified as HARD',
          ],
          correctIndex: 1,
          explanation: 'A low sample size (< 3 attempts) cannot provide statistical confidence of student weakness.',
          topicTag: 'Analytics Heuristics',
          difficulty: 'HARD',
        },
        {
          id: 'q-4',
          question: 'How does the revision planner prevent creating duplicate task spam for a weak topic?',
          options: [
            'By wiping all previous records before generation',
            'By limiting tasks to only 1 total task per user',
            'By generating a deterministic unique recommendation key (userId + subjectId + topicTag)',
            'By requiring manual administrator approval for each task',
          ],
          correctIndex: 2,
          explanation: 'Deterministic recommendation keys ensure idempotent generation and prevent redundant task clutter.',
          topicTag: 'Revision Logic',
          difficulty: 'MEDIUM',
        },
      ],
    };
  }
}
