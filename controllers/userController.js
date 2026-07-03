const db = require('../db');

// FUNGSI UNTUK MENGAMBIL DATA PROFIL USER (MENGGUNAKAN STORED PROCEDURE & FUNCTION)
exports.getProfile = async (req, res) => {
    // id_user diambil dari token JWT orang yang sedang login
    const id_user = req.user.id_user; 

    try {
        // 1. Panggil Stored Procedure 'profile_user' yang sudah Anda buat di MySQL
        // Di Node.js, pemanggilan procedure menggunakan sintaks: CALL nama_procedure(?)
        const [profileRows] = await db.query('CALL `profile_user`(?)', [id_user]);
        
        // Stored Procedure biasanya mengembalikan array di dalam array, jadi kita ambil index pertama
        const userData = profileRows[0][0]; 

        if (!userData) {
            return res.status(404).json({ success: false, message: 'Data pengguna tidak ditemukan!' });
        }

        // 2. Panggil Function 'jumlah_post' dari database untuk menghitung total post user ini
        const [countRows] = await db.query('SELECT jumlah_post(?) AS total_post', [id_user]);
        const totalPost = countRows[0].total_post;

        // 3. Kirimkan gabungan hasilnya sebagai respon ke website/frontend
        res.json({
            success: true,
            message: 'Berhasil memuat profil pengguna',
            data: {
                id_user: userData.id_user,
                nim: userData.nim,
                nama_lengkap: userData.nama_lengkap,
                email_amikom: userData.email_amikom,
                prodi: userData.prodi,
                bio: userData.bio || '',
                foto_profil: userData.foto_profil || null,
                total_post: totalPost // Hasil dari database function Anda
            }
        });

    } catch (error) {
        console.error("Error saat memuat profil:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mengambil data profil' });
    }
};