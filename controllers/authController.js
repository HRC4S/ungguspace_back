const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 1. FUNGSI REGISTER
exports.register = async (req, res) => {
    const { nim, nama_lengkap, email_amikom, prodi, password } = req.body;

    // Validasi input wajib
    if (!nim || !nama_lengkap || !email_amikom || !password) {
        return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi!' });
    }

    try {
        // Cek apakah NIM atau Email sudah terdaftar
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE nim = ? OR email_amikom = ?', 
            [nim, email_amikom]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'NIM atau Email Amikom sudah terdaftar!' });
        }

        // Hash / Enkripsi Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate UUID untuk id_user (Format CHAR 36)
        const id_user = uuidv4();

        // Simpan ke database XAMPP
        await db.query(
            `INSERT INTO users (id_user, nim, nama_lengkap, email_amikom, prodi, password_hash, is_verified) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`, // Sementara di-set 1 (Verified) agar bisa langsung uji coba fitur
            [id_user, nim, nama_lengkap, email_amikom, prodi || null, passwordHash]
        );

        res.status(201).json({ success: true, message: 'Registrasi akun UnguSpace berhasil!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};

// 2. FUNGSI LOGIN
exports.login = async (req, res) => {
    const { email_amikom, password } = req.body;

    if (!email_amikom || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi!' });
    }

    try {
        // Cari user berdasarkan email
        const [users] = await db.query('SELECT * FROM users WHERE email_amikom = ?', [email_amikom]);
        
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Email atau password salah!' });
        }

        const user = users[0];

        // Validasi password cocok atau tidak
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Email atau password salah!' });
        }

        // Buat Token JWT untuk sesi login website
        const token = jwt.sign(
            { id_user: user.id_user, nim: user.nim },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Berlaku 1 hari
        );

        res.json({
            success: true,
            message: 'Login Berhasil!',
            token,
            user: {
                id_user: user.id_user,
                nama_lengkap: user.nama_lengkap,
                email: user.email_amikom
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
};