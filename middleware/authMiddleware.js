const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // Ambil token dari header HTTP 'Authorization'
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Akses ditolak, token tidak ditemukan!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token JWT
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Menyimpan data user (id_user & nim) ke dalam request
        next(); // Lanjut ke fungsi berikutnya di controller
    } catch (error) {
        res.status(400).json({ success: false, message: 'Token tidak valid!' });
    }
};