const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const verifyToken = require('../middleware/authMiddleware'); // Import penjaga token

// Endpoint membuat postingan (wajib login / pakai token)
router.post('/create', verifyToken, postController.createPost);

// Endpoint melihat feed beranda (bisa diakses publik atau sesuai kebutuhan)
router.get('/feed', postController.getFeed);

module.exports = router;