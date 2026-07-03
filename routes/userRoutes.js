const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware'); // Wajib bawa token login

// Endpoint untuk mengambil profil user yang sedang login
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;