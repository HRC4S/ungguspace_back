const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Menyambungkan URL endpoint ke fungsi controller
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;