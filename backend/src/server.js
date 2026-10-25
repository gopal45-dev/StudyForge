import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`[StudyForge Server running] on port ${PORT}`);
  console.log(`[Health check ready] http://localhost:${PORT}/api/health`);
});
