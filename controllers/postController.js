const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// 1. FUNGSI MEMBUAT POSTINGAN BARU (DISESUAIKAN DENGAN DATABASE ASLI)
exports.createPost = async (req, res) => {
    // Kita hanya mengambil variabel yang benar-benar ada di tabel posts Anda
    const { konten_teks, media_url, kategori } = req.body;
    const id_user = req.user.id_user; // Diambil otomatis dari token login lewat middleware

    if (!konten_teks) {
        return res.status(400).json({ success: false, message: 'Konten teks postingan tidak boleh kosong!' });
    }

    try {
        const id_post = uuidv4(); // Generate UUID untuk id_post

        // Query INSERT disesuaikan: Tanpa kolom visibilitas
        await db.query(
            `INSERT INTO posts (id_post, id_user, konten_teks, media_url, kategori) 
             VALUES (?, ?, ?, ?, ?)`,
            [id_post, id_user, konten_teks, media_url || null, kategori || 'Umum']
        );

        res.status(201).json({ 
            success: true, 
            message: 'Postingan berhasil dipublikasikan!',
            id_post 
        });

    } catch (error) {
        console.error("Error saat membuat post:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat membuat postingan' });
    }
};

// 2. FUNGSI MENGAMBIL FEED POSTINGAN (MENGGUNAKAN VIEW 'post_feed')
exports.getFeed = async (req, res) => {
    try {
        // Memanggil VIEW 'post_feed' yang sudah Anda buat di phpMyAdmin
        const [rows] = await db.query('SELECT * FROM post_feed ORDER BY tanggal_buat DESC');
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error saat mengambil feed:", error);
        res.status(500).json({ success: false, message: 'Gagal memuat beranda/feed' });
    }
};