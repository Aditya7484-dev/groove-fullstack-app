const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving (uploads) ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve frontend ──
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes ──
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/songs',  require('./routes/songs'));
app.use('/api/users',  require('./routes/users'));

// ── Catch-all: serve frontend index ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── MongoDB connection ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
   const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎵 Groove server running on port ${PORT}`);
});
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
