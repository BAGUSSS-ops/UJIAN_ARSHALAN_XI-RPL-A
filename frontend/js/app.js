const API_URL = "http://localhost:5000/api";

let dataAlatGlobal = [];
let dataPeminjamanGlobal = [];
let idPeminjamanEdit = null;

document.addEventListener("DOMContentLoaded", () => {
    muatSemuaData();
});

async function muatSemuaData() {
    await ambilDataAlat();
    await ambilDataKategori();
    await ambilDataPeminjaman();
}

// alat
async function ambilDataAlat() {
    try {
        const res = await fetch(`${API_URL}/alat`);
        const data = await res.json();
        dataAlatGlobal = data;

        const tbody = document.getElementById("daftarAlat");
        const selectAlat = document.getElementById("alat");

        tbody.innerHTML = "";
        selectAlat.innerHTML = '<option value="">--- Daftar Alat ---</option>';

        data.forEach((item) => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${item.id_alat}</td>
                    <td class="px-4 py-3 font-medium">${item.nama_alat}</td>
                    <td class="px-4 py-3">${item.kondisi}</td>
                    <td class="px-4 py-3">${item.stok}</td>
                    <td class="px-4 py-3 space-x-2">
                        <button onclick="editStokAlat(${item.id_alat}, ${item.stok})" class="text-blue-600 hover:underline text-xs font-semibold">Edit Stok</button>
                        <button onclick="hapusData('alat', ${item.id_alat})" class="text-red-600 hover:underline text-xs font-semibold">Hapus</button>
                    </td>
                </tr>
            `;

            selectAlat.innerHTML += `
                <option value="${item.id_alat}">${item.nama_alat} (Stok: ${item.stok})</option>
            `;
        });
    } catch (err) {
        console.error("Gagal mengambil data alat:", err);
    }
}

document.getElementById("btnTambahAlat").addEventListener("click", async () => {
    const nama_alat = prompt("Masukkan Nama Alat:");
    if (!nama_alat) return;
    const kondisi = prompt("Masukkan Kondisi Alat (Baik / Rusak Ringan):", "Baik");
    const stok = parseInt(prompt("Masukkan Jumlah Stok:", "1"), 10);
    const id_kategori = prompt("Masukkan ID Kategori (Opsional, kosongkan jika tidak ada):");

    try {
        const res = await fetch(`${API_URL}/alat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_kategori: id_kategori ? parseInt(id_kategori) : null,
                nama_alat,
                kondisi,
                stok: isNaN(stok) ? 0 : stok,
                lokasi: "Lab RPL"
            })
        });

        if (res.ok) {
            alert("Alat berhasil ditambahkan!");
            muatSemuaData();
        } else {
            const err = await res.json();
            alert("Gagal menambah alat: " + err.error);
        }
    } catch (err) {
        console.error(err);
    }
});

async function editStokAlat(id, stokLama) {
    const stokBaru = prompt("Masukkan jumlah stok baru:", stokLama);
    if (stokBaru === null) return;

    try {
        const res = await fetch(`${API_URL}/alat/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stok: parseInt(stokBaru) })
        });
        if (res.ok) muatSemuaData();
    } catch (err) {
        console.error(err);
    }
}

// kategori
async function ambilDataKategori() {
    try {
        const res = await fetch(`${API_URL}/kategori_alat`);
        const data = await res.json();
        const tbody = document.getElementById("daftarKategori");
        tbody.innerHTML = "";

        data.forEach((item) => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${item.id_kategori}</td>
                    <td class="px-4 py-3 font-medium">${item.nama_kategori}</td>
                    <td class="px-4 py-3">${item.deskripsi || "-"}</td>
                    <td class="px-4 py-3">
                        <button onclick="hapusData('kategori_alat', ${item.id_kategori})" class="text-red-600 hover:underline text-xs font-semibold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal mengambil data kategori:", err);
    }
}

document.getElementById("btnTambahKategori").addEventListener("click", async () => {
    const nama_kategori = prompt("Masukkan Nama Kategori:");
    if (!nama_kategori) return;
    const deskripsi = prompt("Masukkan Deskripsi Kategori:");

    try {
        const res = await fetch(`${API_URL}/kategori_alat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama_kategori, deskripsi })
        });

        if (res.ok) {
            alert("Kategori berhasil ditambahkan!");
            ambilDataKategori();
        } else {
            const err = await res.json();
            alert("Gagal menambah kategori: " + err.error);
        }
    } catch (err) {
        console.error(err);
    }
});

// peminjaman
async function ambilDataPeminjaman() {
    try {
        const res = await fetch(`${API_URL}/peminjaman`);
        const data = await res.json();
        dataPeminjamanGlobal = data;

        const tbody = document.getElementById("daftarPeminjaman");
        tbody.innerHTML = "";

        data.forEach((item) => {
            const alatDitemukan = dataAlatGlobal.find(a => a.id_alat === item.id_alat);
            const namaAlat = alatDitemukan ? alatDitemukan.nama_alat : `ID: ${item.id_alat}`;

            const tglPinjam = item.tanggal_pinjam ? item.tanggal_pinjam.split("T")[0] : "-";
            const tglKembali = item.tanggal_kembali ? item.tanggal_kembali.split("T")[0] : "-";

            let badgeColor = "bg-yellow-100 text-yellow-800";
            if (item.status === "Dikembalikan") badgeColor = "bg-green-100 text-green-800";
            if (item.status === "Terlambat") badgeColor = "bg-red-100 text-red-800";

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">${item.id_peminjaman}</td>
                    <td class="px-4 py-3 font-medium">${item.nama_peminjam}</td>
                    <td class="px-4 py-3">${item.kelas}</td>
                    <td class="px-4 py-3">${namaAlat}</td>
                    <td class="px-4 py-3">${item.jumlah}</td>
                    <td class="px-4 py-3">${tglPinjam}</td>
                    <td class="px-4 py-3">${tglKembali}</td>
                    <td class="px-4 py-3">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}">
                            ${item.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 space-x-2">
                        <button onclick="mulaiEditPeminjaman(${item.id_peminjaman})" class="text-blue-600 hover:underline text-xs font-semibold">Edit</button>
                        <button onclick="hapusData('peminjaman', ${item.id_peminjaman})" class="text-red-600 hover:underline text-xs font-semibold">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal mengambil data peminjaman:", err);
    }
}

// edit peminjaman
function mulaiEditPeminjaman(id) {
    const item = dataPeminjamanGlobal.find(p => p.id_peminjaman === id);
    if (!item) return;

    idPeminjamanEdit = id;

    document.getElementById("nama_peminjam").value = item.nama_peminjam;
    document.getElementById("kelas").value = item.kelas;
    document.getElementById("alat").value = item.id_alat;
    document.getElementById("jumlah").value = item.jumlah;
    document.getElementById("tanggal_pinjam").value = item.tanggal_pinjam ? item.tanggal_pinjam.split("T")[0] : "";
    document.getElementById("tanggal_kembali").value = item.tanggal_kembali ? item.tanggal_kembali.split("T")[0] : "";
    document.getElementById("status").value = item.status;

    const form = document.getElementById("formPinjam");
    const btnSubmit = form.querySelector("button[type='submit']");
    btnSubmit.textContent = `Simpan Perubahan (ID: ${id})`;
    btnSubmit.style.backgroundColor = "#d97706";

    if (!document.getElementById("btnBatalEdit")) {
        const btnBatal = document.createElement("button");
        btnBatal.type = "button";
        btnBatal.id = "btnBatalEdit";
        btnBatal.textContent = "Batal Edit";
        btnBatal.className = "w-full text-white font-semibold py-2.5 rounded-lg transition mt-2";
        btnBatal.style.backgroundColor = "#6b7280";
        btnBatal.onclick = resetFormPeminjaman;
        form.appendChild(btnBatal);
    }

    form.scrollIntoView({ behavior: "smooth" });
}

// reset form
function resetFormPeminjaman() {
    idPeminjamanEdit = null;
    const form = document.getElementById("formPinjam");
    form.reset();

    const btnSubmit = form.querySelector("button[type='submit']");
    btnSubmit.textContent = "Ajukan Peminjaman";
    btnSubmit.style.backgroundColor = "";

    const btnBatal = document.getElementById("btnBatalEdit");
    if (btnBatal) btnBatal.remove();
}

// submit peminjaman
document.getElementById("formPinjam").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        nama_peminjam: document.getElementById("nama_peminjam").value,
        kelas: document.getElementById("kelas").value,
        id_alat: parseInt(document.getElementById("alat").value),
        jumlah: parseInt(document.getElementById("jumlah").value),
        tanggal_pinjam: document.getElementById("tanggal_pinjam").value,
        tanggal_kembali: document.getElementById("tanggal_kembali").value,
        status: document.getElementById("status").value
    };

    try {
        const url = idPeminjamanEdit 
            ? `${API_URL}/peminjaman/${idPeminjamanEdit}` 
            : `${API_URL}/peminjaman`;
        const method = idPeminjamanEdit ? "PATCH" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(idPeminjamanEdit ? "Data peminjaman berhasil diupdate!" : "Peminjaman berhasil diajukan!");
            resetFormPeminjaman();
            ambilDataPeminjaman();
        } else {
            const err = await res.json();
            alert("Gagal menyimpan data: " + err.error);
        }
    } catch (err) {
        console.error("Error saat mengirim form:", err);
    }
});

// hapus data
async function hapusData(endpoint, id) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
        const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            muatSemuaData();
        } else {
            const err = await res.json();
            alert("Gagal menghapus: " + err.error);
        }
    } catch (err) {
        console.error(err);
    }
}