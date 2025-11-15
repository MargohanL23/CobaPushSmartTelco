// SmartTelco-FrontEnd/assets/js/history.js

document.addEventListener('DOMContentLoaded', loadHistory);

function loadHistory() {
    const tableBody = document.querySelector('#history-table tbody');
    const noHistoryMessage = document.getElementById('no-history-message');
    const customerId = localStorage.getItem('currentUserId');
    
    // Ambil semua riwayat
    const allHistory = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    
    // Filter riwayat hanya untuk pengguna yang sedang login
    const userHistory = allHistory.filter(record => record.id === customerId);
    
    // Kosongkan tabel
    tableBody.innerHTML = '';

    if (userHistory.length === 0) {
        noHistoryMessage.style.display = 'block';
        document.querySelector('#history-table').style.display = 'none';
        document.getElementById('history-header').textContent = `Belum ada riwayat prediksi untuk ID ${customerId}.`;
        return;
    }

    noHistoryMessage.style.display = 'none';
    document.querySelector('#history-table').style.display = 'table';
    document.getElementById('history-header').textContent = `Menampilkan ${userHistory.length} riwayat prediksi untuk ID ${customerId}.`;

    userHistory.forEach(record => {
        const row = tableBody.insertRow();
        
        // Kolom 1: Tanggal
        row.insertCell().textContent = record.date;
        
        // Kolom 2: ID Pelanggan
        row.insertCell().textContent = record.id;
        
        // Kolom 3: Rekomendasi Utama
        row.insertCell().textContent = record.recommendation;
        
        // Kolom 4: Keyakinan
        row.insertCell().textContent = record.confidence;
        
        // Kolom 5: Lihat Profil (Link untuk simulasi ulang)
        const profileCell = row.insertCell();
        const profileLink = document.createElement('a');
        profileLink.href = `data_input.html?load_id=${record.id}`;
        profileLink.textContent = 'Lihat Profil';
        profileLink.className = 'btn-link';
        profileCell.appendChild(profileLink);
    });
}