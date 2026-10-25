# StudyForge 🚀
> **AI-Powered Learning & Revision Workspace for College Students**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)

Turn raw course PDFs and lecture notes into a structured, measurable, and closed-loop revision system:
**Upload Material** ➔ **Extract & Validate Text** ➔ **Generate Grounded Study Assets** ➔ **Server-Scored Quiz Arena** ➔ **Topic Analytics** ➔ **Automated Revision Planner**.

---

## 🌐 Live Deployment
- **Live Application (Vercel)**: [https://study-forge-jet.vercel.app](https://study-forge-jet.vercel.app)
- **Backend REST API (Render)**: [https://studyforge-5w6a.onrender.com](https://studyforge-5w6a.onrender.com)
- **API Health Check**: [https://studyforge-5w6a.onrender.com/api/health](https://studyforge-5w6a.onrender.com/api/health)

---

## 📌 Problem Statement
College students frequently gather hundreds of lecture slides and course PDFs before midterms and finals, but spend disproportionate time manually converting dense material into practice tests, flashcards, and revision schedules. Most generic AI tools serve merely as prompt wrappers that output disconnected text without tracking learning progress over time. Students lack a **persistent, closed-loop workspace** that measures what they have actually mastered and directs their revision toward verifiable knowledge gaps.

---

## 🎯 Target Users
- **College & University Students**: Preparing for midterms, quizzes, and end-term exams who need structured retention from lecture notes.
- **Self-Directed Learners**: Needing quantitative tracking of topic mastery rather than passive reading.

---

## 💡 Solution: The Closed Learning Loop
StudyForge bridges document organization, AI asset generation, assessment scoring, topic performance analytics, and prioritized revision into a single persistent MERN platform:

```
[Course PDF / Notes]
         │
         ▼
[Document Ingestion & Text Integrity Check]
         │
         ▼
[AI Study Asset Generation]
  ├── Grounded Academic Summary
  ├── Spaced-Repetition Flashcards
  └── 4-Choice MCQ Quiz (Answers Confidential)
         │
         ▼
[Server-Scored Quiz Assessment] ➔ [Instant Mistakes Breakdown]
         │
         ▼
[Topic Performance Engine] (Identifies Weak Subtopics < 65% Accuracy)
         │
         ▼
[Automated Revision Planner] (Generates Prioritized, Deduplicated Review Tasks)
```

---

## 🌟 Key Features & Major Workflows

1. **Document Library & Extraction**:
   - Secure upload of lecture PDFs and text files with 10MB bounds and MIME-type validation.
   - Text integrity extraction via `pdf-parse`; detects image-only / non-OCR scans with actionable error explanations.
   - Idempotent re-upload: Re-uploading an updated version of a file replaces the old copy and purges stale resources.

2. **Grounded Study Asset Generator**:
   - **Academic Summary**: Executive overview, core concepts, definitions, formulas, and revision checklist.
   - **Spaced-Repetition Flashcards**: Interactive 3D flip-cards with spaced repetition rating intervals (Again = 1d, Hard = 2d, Good = 4d, Easy = 7d).
   - **Practice Assessments**: Multi-choice quizzes grounded strictly in source content.

3. **Secure Server-Side Assessment**:
   - **Answer Key Confidentiality**: The server explicitly obfuscates `correctIndex` and `explanation` before delivery to prevent DevTools inspection.
   - **Server Grading**: Answers, accuracy percentages, and timing are computed and committed on the server.

4. **Topic Performance Analytics**:
   - Tracks student proficiency across granular topic tags (e.g., *Three-Way Handshake*, *Subnetting*, *Virtual Memory*).
   - **Statistical Confidence Heuristic**: Requires at least 3 empirical question evaluations before classifying a topic as weak, preventing premature alerts.

5. **Revision Planner & Task Tracker**:
   - **Automated Recommendations**: Detects weak topics and creates prioritized revision tasks (`HIGH`, `MEDIUM`, `LOW`).
   - **Deduplication Engine**: Uses composite keys (`userId + subjectId + topicTag`) to prevent task clutter.
   - **Manual Task Creation**: Custom slide-down subject selector to add custom revision topics and deadlines.
   - **Interactive Checklist**: Mark tasks completed as you study.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, TanStack Query, Recharts, Axios |
| **Backend** | Node.js, Express.js (ES Modules), Multer, `pdf-parse` |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) with Heuristic Mock Fallback |
| **Authentication** | JWT with HTTP-only Cookies & Bearer token fallback, `bcryptjs` |
| **Testing** | Vitest & Supertest |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📐 System Architecture & Project Structure

```text
StudyForge/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & environment settings
│   │   ├── controllers/     # Modular business logic (Auth, Docs, Quiz, Revision)
│   │   ├── middleware/      # Auth guards, Multer uploads, Centralized error handler
│   │   ├── models/          # 9 Mongoose schemas (User, Subject, Document, Quiz, etc.)
│   │   ├── routes/          # REST API endpoints (/api/v1/...)
│   │   └── services/        # Gemini AI Service & PDF Text Extraction Service
│   ├── tests/               # Vitest automated test suite
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── public/              # Custom StudyForge SVG favicon & assets
│   ├── src/
│   │   ├── api/             # Axios client with cross-origin token interceptors
│   │   ├── components/      # Navigation bar & reusable UI components
│   │   ├── context/         # AuthContext & session management
│   │   └── pages/           # Dashboard, Subjects, Resource Viewer, Quiz Arena, Revision
│   ├── vercel.json          # SPA rewrite rules for Vercel deployment
│   ├── package.json
│   └── vite.config.js
├── .env.example             # Sanitized environment variable template
├── package.json             # Root orchestrator scripts
└── README.md
```

---

## 🔒 Security & Engineering Highlights

- **No Plaintext Passwords**: Passwords hashed using `bcryptjs` with salt rounds.
- **Dual-Mode Authentication**: Supports secure HTTP-only cookies alongside Bearer token headers in `localStorage` for cross-origin reliability between Vercel and Render.
- **No Client Answer Leaks**: Quiz questions delivered to browsers omit answers; grading happens purely server-side.
- **Resilient AI Pipeline**: Dedicated `AIService` abstraction with automatic offline heuristic fallback so grading/evaluations never fail due to API quotas or network delays.
- **Cascading Deletions**: Deleting a document or quiz automatically cleans up linked records and disk files to prevent orphan data.

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or free MongoDB Atlas URI)

### 2. Clone the Repository
```bash
git clone https://github.com/gopal45-dev/StudyForge.git
cd StudyForge
```

### 3. Install Dependencies
```bash
npm run install:all
```
*(Or `npm install` inside both `backend` and `frontend`)*

### 4. Configure Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_2026
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
MAX_FILE_SIZE_BYTES=10485760
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 5. Run the Application
Open two terminals:

**Terminal 1 (Backend):**
```bash
npm run backend
```

**Terminal 2 (Frontend):**
```bash
npm run frontend
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Running Automated Tests
```bash
npm test
```
Runs the Vitest API test suite covering health checks, authentication guards, and validation logic.

---

## 🌐 Deployment Guide

### Backend (Render)
1. Link your GitHub repository on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `AI_PROVIDER`, `GEMINI_API_KEY`, and `CLIENT_URL`.

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: `Vite`.
4. Add environment variable: `VITE_API_URL=https://your-render-service.onrender.com/api/v1`.
5. Deploy!

---

## 📋 End-Term Project Submission Details

- **Project Name**: StudyForge
- **GitHub Repository**: [https://github.com/gopal45-dev/StudyForge](https://github.com/gopal45-dev/StudyForge)
- **Tech Stack**: MongoDB Atlas, Express.js, React (Vite), Node.js, Tailwind CSS, Google Gemini API
- **Major Features**:
  1. PDF Ingestion & Text Integrity Extraction
  2. Grounded Summaries & Spaced-Repetition Flashcards
  3. Server-Evaluated Quiz Arena with Answer Key Confidentiality
  4. Topic Mastery Analytics with Sample Size Weighting
  5. Deduplicated Revision Task Planner
