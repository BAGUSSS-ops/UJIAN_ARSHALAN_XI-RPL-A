const { Pool } = require("pg");
require("dotenv").config(); // Membaca file .env
const pool = new Pool({ 
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.on("error", (err, client) => {
 console.error("Error tidak terduga pada database", err);
 process.exit(-1);
});

module.exports = pool;

// {
//   "id_alat": 3,
//   "nama_peminjam": "Bagus",
//   "kelas": "XI RPL A",
//   "tanggal_pinjam": "2026-11-19",
//   "tanggal_kembali": "2026-11-22",
//   "jumlah": 3,
//   "status": "Dipinjam"
// }