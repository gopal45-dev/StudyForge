# StudyForge 🚀
> **AI-Powered Learning & Revision Workspace for College Students**

Turn your lecture materials and course PDFs into a structured, measurable learning loop:
**Upload Material** ➔ **Extract & Validate** ➔ **Generate Grounded Study Resources** ➔ **Attempt Server-Scored Quizzes** ➔ **Analyze Weak Topics** ➔ **Automated Revision Planner**.

---

## 🛠️ Technology Stack
- **Frontend**: React + Vite, Tailwind CSS, Lucide React, TanStack Query, Recharts, Axios
- **Backend**: Node.js, Express.js (ES Modules), Multer, `pdf-parse`
- **Database**: MongoDB & Mongoose
- **AI Integration**: Google Gemini API (`@google/generative-ai`) with offline heuristic fallback
- **Authentication**: JWT with HTTP-only Cookies & `bcryptjs`
- **Testing**: Vitest & Supertest

---

## 📂 Project Structure
```text
studyforge/
├── client/                 # React Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # UI components & Navbar
│   │   ├── context/        # Auth Context
│   │   └── pages/          # Dashboard, Subjects, Quiz Arena, Revision Planner
│   └── package.json
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, Upload, Error handler
│   │   ├── models/         # Mongoose Schemas (User, Subject, Document, Quiz, etc.)
│   │   ├── routes/         # REST API endpoints
│   │   └── services/       # AI Service (Gemini/Mock) & PDF extractor
│   ├── tests/              # Vitest & Supertest test suite
│   └── package.json
├── docs/                   # PRD and Architecture documents
├── .env.example            # Environment variables template
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Environment Configuration
Copy the template in the root directory:
```bash
cp .env.example .env
```
Inside `.env` or `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studyforge
JWT_SECRET=your_jwt_secret_key
AI_PROVIDER=mock       # Set to 'gemini' and provide GEMINI_API_KEY for live AI
GEMINI_API_KEY=your_key_here
```

### 3. Installation & Run
Run from the root directory:
```bash
# Start backend server
cd server
npm install
npm run dev

# In a second terminal, start the client
cd client
npm install
npm run dev
```

Visit **http://localhost:5173** to use StudyForge.

---

## 🧪 Running Automated Tests
```bash
cd server
npm test
```
Runs API smoke tests, endpoint authentication guards, and validation checks.
