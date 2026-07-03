const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const userRoutes = require('./routes/userRoutes'); // Import baru

// Daftarkan Endpoint API ke Aplikasi
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/users', userRoutes); // Daftarkan di sini

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});