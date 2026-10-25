import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyforge';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // In local dev without local mongo running, log warning but do not crash process immediately if mock mode is used
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
