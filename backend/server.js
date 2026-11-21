const pool = require("./db");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json()); 


function kirimError(err, res) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
}


app.get("/", (req, res) => {
    res.send("Selamat datang di Server Backend Peminjaman alat!");
});


// GET (AMBIL DATA)

app.get("/api/alat", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM alat ORDER BY id_alat ASC");
        res.json(result.rows);
    } catch (err) {
        kirimError(err, res);
    }
});

app.get("/api/peminjaman", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM peminjaman ORDER BY id_peminjaman DESC");
        res.json(result.rows);
    } catch (err) {
        kirimError(err, res);
    }
});

app.get("/api/kategori_alat", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM kategori_alat ORDER BY id_kategori ASC");
        res.json(result.rows);
    } catch (err) {
        kirimError(err, res);
    }
});


// DELETE (HAPUS DATA)

app.delete("/api/alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM alat WHERE id_alat = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Alat tidak ditemukan" });
        }
        res.json({ pesan: "Alat berhasil dihapus" });
    } catch (err) {
        kirimError(err, res);
    }
});

app.delete("/api/kategori_alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM kategori_alat WHERE id_kategori = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kategori tidak ditemukan" });
        }
        res.json({ pesan: "Kategori berhasil dihapus" });
    } catch (err) {
        kirimError(err, res);
    }
});

app.delete("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM peminjaman WHERE id_peminjaman = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
        }
        res.json({ pesan: "Peminjaman berhasil dihapus" });
    } catch (err) {
        kirimError(err, res);
    }
});


// POST (TAMBAH DATA)

app.post("/api/alat", async (req, res) => {
    try {
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
        const result = await pool.query(
            `INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_kategori || null, nama_alat, kondisi, stok, lokasi || "-"]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        kirimError(err, res);
    }
});

app.post("/api/kategori_alat", async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body;
        const result = await pool.query(
            `INSERT INTO kategori_alat (nama_kategori, deskripsi)
             VALUES ($1, $2) RETURNING *`,
            [nama_kategori, deskripsi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        kirimError(err, res);
    }
});

app.post("/api/peminjaman", async (req, res) => {
    try {
        const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;
        const result = await pool.query(
            `INSERT INTO peminjaman (id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        kirimError(err, res);
    }
});


// PATCH (UPDATE DATA)

app.patch("/api/alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
        const query = `
            UPDATE alat SET 
            id_kategori = COALESCE($2, id_kategori),
            nama_alat = COALESCE($3, nama_alat),
            kondisi = COALESCE($4, kondisi),
            stok = COALESCE($5, stok),
            lokasi = COALESCE($6, lokasi)
            WHERE id_alat = $1 RETURNING *
        `;

        const result = await pool.query(query, [
            id,
            id_kategori,
            nama_alat,
            kondisi,
            stok,
            lokasi
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Alat tidak ditemukan" });
        }
        res.json({ pesan: "Update alat berhasil", data: result.rows[0] });
    } catch (err) {
        kirimError(err, res);
    }
});

app.patch("/api/kategori_alat/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori, deskripsi } = req.body;
        const query = `
            UPDATE kategori_alat SET 
            nama_kategori = COALESCE($2, nama_kategori),
            deskripsi = COALESCE($3, deskripsi)
            WHERE id_kategori = $1 RETURNING *
        `;

        const result = await pool.query(query, [
            id,
            nama_kategori,
            deskripsi
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Kategori tidak ditemukan" });
        }
        res.json({ pesan: "Update kategori berhasil", data: result.rows[0] });
    } catch (err) {
        kirimError(err, res);
    }
});

app.patch("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;
        const query = `
            UPDATE peminjaman SET 
            id_alat = COALESCE($2, id_alat),
            nama_peminjam = COALESCE($3, nama_peminjam),
            kelas = COALESCE($4, kelas),
            tanggal_pinjam = COALESCE($5, tanggal_pinjam),
            tanggal_kembali = COALESCE($6, tanggal_kembali),
            jumlah = COALESCE($7, jumlah),
            status = COALESCE($8, status)
            WHERE id_peminjaman = $1 RETURNING *
        `;

        const result = await pool.query(query, [
            id,
            id_alat,
            nama_peminjam,
            kelas,
            tanggal_pinjam,
            tanggal_kembali,
            jumlah,
            status
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
        }
        res.json({ pesan: "Update peminjaman berhasil", data: result.rows[0] });
    } catch (err) {
        kirimError(err, res);
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});