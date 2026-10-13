# StudyForge — Technical Architecture & Implementation Spec

## 1. System Architecture Overview

StudyForge is designed as a modular MERN application with clean separation of concerns:
- **Client**: React 18 SPA built with Vite, Tailwind CSS, Lucide React, and TanStack Query.
- **Server**: Express RESTful API with ES Modules, following the Controller-Service-Repository pattern.
- **Persistence**: MongoDB with Mongoose ODM enforcing multi-tenant userId ownership checks.
- **Ingestion & Extraction**: Multer boundary-enforcing storage with `pdf-parse` for synchronous document inspection.
- **AI Processing**: Dedicated `AIService` abstraction supporting Google Gemini API with fallback mock engines for evaluation without quota consumption.

```
React (Vite Client)
    │
    ▼ (HTTP / JSON / Multi-Part Cookies)
Express REST API (Versioned `/api/v1`)
  ├── Authentication & Ownership Middleware
  ├── Document Parser (`pdf-parse`)
  ├── AI Grounding Service (Gemini API / Heuristic Fallback)
  └── Assessment & Scoring Engine
    │
    ▼
MongoDB
  ├── Users
  ├── Subjects
  ├── Documents
  ├── StudyResources (Summaries & Flashcards)
  ├── Quizzes & QuizAttempts
  ├── TopicPerformance
  └── RevisionTasks
```

## 2. Security Design
- **Answer Key Confidentiality**: The server explicitly obfuscates `correctIndex` and `explanation` from quiz payloads until an attempt is submitted and graded server-side.
- **Authentication**: JWT tokens stored in HTTP-only, SameSite cookies with fallback Bearer header recognition.
- **File Validation**: Strict MIME-type inspection, file signature validation, and size capping at 10MB.
- **Idempotent Revision Planning**: Revision recommendations generate deterministic composite keys (`userId + subjectId + topicTag`) to prevent task clutter.

## 3. Spaced Repetition Scheduling
Flashcards utilize an interval-spaced algorithm:
- `AGAIN`: 1 day interval
- `HARD`: 2 days interval
- `GOOD`: 4 days interval
- `EASY`: 7 days interval
Next review dates are dynamically calculated and recorded in `FlashcardReview`.
