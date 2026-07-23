const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const verifyToken = require('../middleware/authMiddleware'); // Proteksi Token JWT

// Endpoint Like / Unlike
router.post('/like', verifyToken, interactionController.toggleLike);

// Endpoint Mengambil Notifikasi Pengguna (Baru)
router.get('/notifications', verifyToken, interactionController.getNotifications);


router.post('/follow', verifyToken, interactionController.toggleFollow);

router.post('/save-post', verifyToken, interactionController.toggleSavePost); // Menyimpan atau Hapus simpanan post
router.get('/saved-posts', verifyToken, interactionController.getSavedPosts); // Melihat daftar post yang disimpan oleh saya

// Endpoint Komentar (Baru)
router.post('/comment', verifyToken, interactionController.addComment); // Wajib login untuk kirim komen
router.get('/comments/:id_post', interactionController.getCommentsByPost); // Siapa saja bisa lihat komentar di suatu post


module.exports = router;