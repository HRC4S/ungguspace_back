const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// 1. FUNGSI UNTUK LIKE / UNLIKE POSTINGAN (DENGAN TRIGGER MYSQL)
exports.toggleLike = async (req, res) => {
    const { id_post } = req.body;
    const id_user = req.user.id_user; // Diambil dari token login

    if (!id_post) {
        return res.status(400).json({ success: false, message: 'ID Postingan wajib disertakan!' });
    }

    try {
        // Cek apakah user sudah pernah like postingan ini sebelumnya
        const [existingLike] = await db.query(
            'SELECT * FROM likes WHERE id_user = ? AND id_post = ?',
            [id_user, id_post]
        );

        if (existingLike.length > 0) {
            // JIKA SUDAH LIKE -> LAKUKAN UNLIKE (Hapus dari tabel likes)
            await db.query('DELETE FROM likes WHERE id_user = ? AND id_post = ?', [id_user, id_post]);
            
            // Catatan tambahan: Jika melakukan unlike, Anda bisa mengurangi count secara manual di sini 
            // karena trigger database kita hanya di-set AFTER INSERT.
            await db.query('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id_post = ?', [id_post]);

            return res.json({ success: true, message: 'Batal menyukai postingan (Unlike).' });
        } else {
            // JIKA BELUM LIKE -> LAKUKAN LIKE (Insert ke tabel likes)
            const id_like = uuidv4();
            await db.query(
                'INSERT INTO likes (id_like, id_user, id_post) VALUES (?, ?, ?)',
                [id_like, id_user, id_post]
            );
            
            // AUTOMATISASI: Trigger 'update_like' di MySQL akan otomatis menambahkan 'like_count' 
            // di tabel posts dan membuat baris baru di tabel 'notifications'!
            
            return res.json({ success: true, message: 'Berhasil menyukai postingan!' });
        }

    } catch (error) {
        console.error("Error pada Like:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat memproses Like' });
    }
};

// 2. FUNGSI UNTUK MENGAMBIL NOTIFIKASI PENGGUNA
exports.getNotifications = async (req, res) => {
    const id_user = req.user.id_user; // Id user yang sedang login

    try {
        // Ambil notifikasi terbaru milik pengguna, gabungkan dengan nama actor (orang yang memicu notif)
        const [rows] = await db.query(
            `SELECT n.*, u.nama_lengkap AS nama_actor, u.avatar_url AS avatar_actor 
             FROM notifications n
             JOIN users u ON n.actor_id = u.id_user
             WHERE n.id_user = ? 
             ORDER BY n.created_at DESC`,
            [id_user]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error ambil notifikasi:", error);
        res.status(500).json({ success: false, message: 'Gagal memuat notifikasi' });
    }
};

exports.addComment = async (req, res) => {
    const { id_post, konten_komentar } = req.body;
    const id_user = req.user.id_user; // Diambil otomatis dari token login user

    if (!id_post || !konten_komentar) {
        return res.status(400).json({ success: false, message: 'ID Postingan dan isi komentar tidak boleh kosong!' });
    }

    try {
        const id_komentar = uuidv4(); // Generate UUID unik untuk id_komentar

        // Masukkan data komentar ke tabel 'comments' di database XAMPP
        await db.query(
            'INSERT INTO comments (id_komentar, id_post, id_user, konten_komentar) VALUES (?, ?, ?, ?)',
            [id_komentar, id_post, id_user, konten_komentar]
        );

        res.status(201).json({
            success: true,
            message: 'Komentar berhasil ditambahkan!',
            id_komentar
        });

    } catch (error) {
        console.error("Error pada Tambah Komentar:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat menambahkan komentar' });
    }
};

// 4. FUNGSI UNTUK MENGAMBIL DAFTAR KOMENTAR BERDASARKAN ID POST
exports.getCommentsByPost = async (req, res) => {
    const { id_post } = req.params; // Diambil dari parameter URL (misal: /api/interactions/comments/ID_POST)

    try {
        // Ambil data komentar beserta nama mahasiswa yang berkomentar
        const [rows] = await db.query(
            `SELECT c.*, u.nama_lengkap, u.avatar_url 
             FROM comments c
             JOIN users u ON c.id_user = u.id_user
             WHERE c.id_post = ?
             ORDER BY c.created_at ASC`,
            [id_post]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error ambil komentar:", error);
        res.status(500).json({ success: false, message: 'Gagal memuat komentar' });
    }
};