// SmartTelco-FrontEnd/assets/js/login.js

const USER_ID_PREFIX = 'C';
const ADMIN_ID_PREFIX = 'A';
const MESSAGE_ELEMENT = document.getElementById('login-message');

// Fungsi untuk mendapatkan ID baru yang unik (C00001, C00002, dst)
function generateNewCustomerId() {
    // Ambil nomor terakhir dari local storage atau mulai dari 0
    let lastId = localStorage.getItem('lastCustomerIdNum');
    let newNum = (lastId ? parseInt(lastId) + 1 : 1);
    
    // Format nomor menjadi 5 digit (00001)
    let newIdNum = String(newNum).padStart(5, '0');
    
    // Simpan nomor baru dan kembalikan ID lengkap
    localStorage.setItem('lastCustomerIdNum', newNum);
    return USER_ID_PREFIX + newIdNum;
}

// Fungsi untuk menangani login dari input
function handleLogin() {
    const inputId = document.getElementById('login-id').value.trim().toUpperCase();

    if (!inputId) {
        MESSAGE_ELEMENT.textContent = "ID tidak boleh kosong.";
        return;
    }

    // Tentukan peran dan redirect
    if (inputId.startsWith(ADMIN_ID_PREFIX) && inputId.length === 6) {
        // Admin Login
        localStorage.setItem('currentUserId', inputId);
        localStorage.setItem('currentUserRole', 'Admin');
        window.location.href = 'index.html';
    } else if (inputId.startsWith(USER_ID_PREFIX) && inputId.length === 6) {
        // User Login (Simulasi ID Pelanggan yang sudah ada)
        localStorage.setItem('currentUserId', inputId);
        localStorage.setItem('currentUserRole', 'User');
        window.location.href = 'data_input.html'; // Arahkan User ke halaman simulasi/input
    } else {
        MESSAGE_ELEMENT.textContent = "Format ID tidak valid. Contoh: C00001 atau A00001.";
    }
}

// Fungsi untuk membuat ID pelanggan baru
function handleNewUser() {
    const newUserId = generateNewCustomerId();
    
    localStorage.setItem('currentUserId', newUserId);
    localStorage.setItem('currentUserRole', 'User');
    
    alert(`Selamat datang! ID Pelanggan Baru Anda: ${newUserId}.`);
    window.location.href = 'data_input.html';
}