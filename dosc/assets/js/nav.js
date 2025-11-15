// SmartTelco-FrontEnd/assets/js/nav.js

document.addEventListener('DOMContentLoaded', () => {
    const currentUserId = localStorage.getItem('currentUserId');
    const currentUserRole = localStorage.getItem('currentUserRole');
    const navElement = document.querySelector('.navbar nav');
    
    // Jika tidak ada ID, anggap belum login, arahkan ke login
    if (!currentUserId && window.location.pathname.indexOf('login.html') === -1) {
        window.location.href = 'login.html';
        return;
    }
    
    // Bersihkan navigasi lama
    navElement.innerHTML = '';
    
    // Tambahkan link berdasarkan peran
    
    // Home selalu ada
    let homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';
    navElement.appendChild(homeLink);

    // Simulasi/Input Data
    let inputLink = document.createElement('a');
    inputLink.href = 'data_input.html';
    inputLink.textContent = 'Simulasi Profil';
    navElement.appendChild(inputLink);
    
    // Fitur Tambahan untuk User (Misal: Riwayat)
    if (currentUserRole === 'User') {
        // Tambahkan fitur lain jika ada
        let historyLink = document.createElement('a');
        historyLink.href = 'history.html'; // Tautkan ke halaman riwayat 
        historyLink.textContent = 'Riwayat Saya';
        navElement.appendChild(historyLink);
    }

    // Admin Access
    if (currentUserRole === 'Admin') {
        let adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.textContent = 'Dashboard Admin';
        navElement.appendChild(adminLink);
    }

    // Logout Link
    let logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = `Logout (${currentUserId})`;
    logoutLink.onclick = () => {
        localStorage.clear(); // Hapus semua data sesi
        window.location.href = 'login.html';
    };
    navElement.appendChild(logoutLink);
});