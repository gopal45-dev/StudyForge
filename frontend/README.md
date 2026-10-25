# StudyForge Frontend Client 🎨

The modern Single Page Application (SPA) for **StudyForge**, built with React 19, Vite, and Tailwind CSS.

## 🌐 Live Production
- **Deployed App**: [https://study-forge-jet.vercel.app](https://study-forge-jet.vercel.app)
- **Backend API**: [https://studyforge-5w6a.onrender.com/api/v1](https://studyforge-5w6a.onrender.com/api/v1)

---

## ⚡ Tech Stack & Highlights
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 with custom brand palette (`#4f46e5`) and complete Dark Theme support
- **State & Server Cache**: TanStack React Query v5
- **Routing**: React Router v7 with protected route session guards
- **Icons**: Lucide React
- **Data Visualizations**: Recharts for topic mastery analytics
- **HTTP Client**: Axios with dual-authentication interceptor (secure cookies + Bearer token fallback)

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

4. **Production Build**:
   ```bash
   npm run build
   ```
