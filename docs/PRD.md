# StudyForge — Product Requirements Document (PRD)

## 1. Product Overview
**StudyForge** is an AI-powered learning and revision workspace designed specifically for college students preparing for quizzes, midterms, and finals. Unlike simple AI text prompt wrappers, StudyForge implements a closed, measurable **learning loop**:
- **Ingestion & Extraction**: Upload course PDFs or text notes with text integrity checks.
- **Grounded Resource Generation**: Automatically generates modular summaries, spaced-repetition flashcards, and 4-choice MCQ quizzes strictly referencing source concepts.
- **Server-Side Assessment**: Students attempt quizzes with real-time timers; scores, accuracy, and mistake analysis are calculated strictly server-side.
- **Topic Performance Analytics**: Tracks student proficiency by specific topics across assessments with sample size weighting.
- **Revision Planner**: Automatically detects weak topics and schedules prioritized revision tasks to close knowledge gaps.

## 2. Target Persona
- **College / University Students**: Needing structured, actionable revision from dense lecture slides and textbook chapters.
- **Self-Directed Learners**: Seeking to measure mastery quantitatively rather than passively reading notes.

## 3. Core User Journey (The "P0" Loop)
1. **Register / Login**: Secure authentication with HTTP-only cookies.
2. **Create Subject**: (e.g., *Computer Networks*, *Operating Systems*).
3. **Upload Material**: Upload a PDF lecture or syllabus document.
4. **Generate Study Assets**: Trigger AI generator for Summary, Flashcards, and Quizzes.
5. **Study & Test**:
   - Flip flashcards with Spaced Repetition ratings (Again / Hard / Good / Easy).
   - Take an interactive MCQ quiz without exposed answers.
6. **Analyze & Close Gaps**:
   - Inspect quiz results breakdown and topic analytics.
   - Auto-generate or customize Revision Tasks based on detected weak points.
   - Mark tasks complete once reviewed.
