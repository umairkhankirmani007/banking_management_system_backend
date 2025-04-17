import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // 👈 Enable CORS for all origins
app.use(express.json());

// Basic route
app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript + MongoDB!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || '', { dbName: 'test' })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
