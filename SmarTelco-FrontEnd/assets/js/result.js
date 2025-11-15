// SmartTelco-FrontEnd/assets/js/result.js

// --- FUNGSI RIWAYAT (BARU) ---
function saveHistory(result, customerId, inputData) {
    // Ambil riwayat yang sudah ada (atau buat array kosong)
    let history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    
    // Buat objek riwayat baru
    const newRecord = {
        date: new Date().toLocaleString(),
        id: customerId,
        recommendation: result.recommended_offer,
        confidence: result.confidence,
        // Menyimpan data input mentah agar bisa dilihat/diulang dari halaman riwayat
        input: inputData 
    };
    
    // Tambahkan record baru ke awal array (terbaru di atas)
    history.unshift(newRecord);
    
    // Batasi jumlah riwayat (misalnya 50 record) agar Local Storage tidak penuh
    if (history.length > 50) {
        history.pop();
    }
    
    // Simpan kembali ke Local Storage
    localStorage.setItem('predictionHistory', JSON.stringify(history));
}


document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil data dari Local Storage
    // KITA HARUS MENGUBAH NAMA KEY STORAGE AGAR KONSISTEN DENGAN YANG KITA SIMPAN SEBELUMNYA
    // Asumsi: 'recommendationResult' dan 'customerInput' adalah key yang digunakan di script.js
    const resultJson = localStorage.getItem('recommendationResult');
    const inputJson = localStorage.getItem('customerInput');
    const customerId = localStorage.getItem('currentUserId'); // Ambil ID pengguna yang sedang login
    
    if (!resultJson || !inputJson) {
        // Jika data tidak ada, redirect kembali ke halaman simulasi
        alert("Silakan lakukan simulasi terlebih dahulu.");
        window.location.href = 'data_input.html';
        return;
    }

    const result = JSON.parse(resultJson);
    const inputData = JSON.parse(inputJson);

    // --- PANGGIL FUNGSI RIWAYAT SETELAH DATA DIBACA ---
    if (result && customerId) {
        saveHistory(result, customerId, inputData); 
        // Sekarang kita simpan juga inputData untuk referensi
    }
    // --------------------------------------------------

    // 2. Tampilkan Rekomendasi Utama
    const offerNameElement = document.getElementById('offer-name');
    const confidenceElement = document.getElementById('confidence-score');
    const reasonElement = document.getElementById('offer-reason');
    
    offerNameElement.textContent = result.recommended_offer;
    confidenceElement.textContent = result.confidence;

    // Tentukan alasan rekomendasi secara dinamis (sangat penting untuk lomba)
    const reason = generateReason(result.recommended_offer, inputData);
    reasonElement.innerHTML = reason;

    // Tampilkan fakta ringkas pelanggan
    displaySummaryFacts(inputData);
    
    // 3. Tampilkan Rekomendasi Alternatif
    displayAlternatives(result.alternatives);
    
    // Hapus data dari Local Storage setelah ditampilkan (agar tidak ter-save dobel saat refresh)
    localStorage.removeItem('recommendationResult');
    localStorage.removeItem('customerInput');
});


// --- FUNGSI PENDUKUNG ---

// Fungsi untuk membuat alasan dinamis berdasarkan hasil prediksi dan input
function generateReason(offer, data) {
    let reason = "Analisis mendalam terhadap profil Anda menunjukkan bahwa paket ini adalah yang paling optimal. ";
    
    // Format pengeluaran
    const spend = (data.monthly_spend / 1000).toLocaleString('id-ID');
    
    switch (offer) {
        case 'Data Booster':
            reason += `Anda adalah pengguna data yang sangat aktif (Rata-rata **${data.avg_data_usage_gb} GB**). Paket ini dirancang untuk memastikan Anda tidak kehabisan kuota data di tengah bulan.`;
            break;
        case 'Streaming Partner Pack':
            reason += `Dengan persentase penggunaan video mencapai **${(data.pct_video_usage * 100).toFixed(0)}%**, paket ini memberikan kuota khusus untuk layanan streaming favorit Anda, menghemat kuota utama.`;
            break;
        case 'Voice Bundle':
            reason += `Rata-rata durasi panggilan Anda adalah **${data.avg_call_duration} menit**. Paket ini menawarkan menit telepon murah/gratis yang akan menghemat biaya bulanan Anda.`;
            break;
        case 'Roaming Pass':
            reason += `Skor perjalanan Anda (**${data.travel_score.toFixed(2)}**) mengindikasikan Anda sering bepergian. Roaming Pass akan menjamin konektivitas Anda di luar negeri dengan tarif hemat.`;
            break;
        case 'Retention Offer':
            reason += `Mengingat riwayat Anda memiliki **${data.complaint_count} keluhan** atau pengeluaran rendah (Rp ${spend}.000), ini adalah penawaran spesial untuk menjaga kepuasan dan loyalitas Anda.`;
            break;
        case 'Top-up Promo':
            reason += `Sebagai pelanggan **${data.plan_type}** dengan frekuensi top-up **${data.topup_freq}x** per bulan, promo ini memberikan nilai tambah setiap kali Anda mengisi ulang.`;
            break;
        case 'General Offer':
            reason += `Pola penggunaan Anda seimbang di semua kategori. Ini adalah paket serbaguna yang menawarkan nilai terbaik untuk penggunaan harian Anda.`;
            break;
        default:
            reason += "Rekomendasi ini sangat cocok dengan pola penggunaan Anda secara keseluruhan.";
    }
    return reason;
}

// Fungsi untuk menampilkan fakta ringkas input pelanggan
function displaySummaryFacts(data) {
    const factsContainer = document.getElementById('summary-facts');
    factsContainer.innerHTML = '';
    
    // Array fakta yang ingin ditampilkan
    const facts = [
        { label: 'Jenis Paket', value: data.plan_type, icon: '📞' },
        { label: 'Data Bulanan', value: `${data.avg_data_usage_gb.toFixed(1)} GB`, icon: '🌐' },
        { label: 'Video Share', value: `${(data.pct_video_usage * 100).toFixed(0)}%`, icon: '🎬' },
        { label: 'Pengeluaran', value: `Rp ${(data.monthly_spend / 1000).toFixed(0)}K`, icon: '💸' },
        { label: 'Travel Score', value: data.travel_score.toFixed(2), icon: '✈️' },
        { label: 'Keluhan', value: `${data.complaint_count}x`, icon: '⚠️' }
    ];

    facts.forEach(fact => {
        const item = document.createElement('div');
        item.className = 'fact-item';
        item.innerHTML = `<strong>${fact.icon} ${fact.label}:</strong> <span>${fact.value}</span>`;
        factsContainer.appendChild(item);
    });
}

// Fungsi untuk menampilkan rekomendasi alternatif
function displayAlternatives(alternatives) {
    const alternativesContainer = document.getElementById('alternatives-list');
    alternativesContainer.innerHTML = ''; // Bersihkan konten lama

    if (alternatives.length === 0) {
        alternativesContainer.innerHTML = '<p class="text-muted">Model tidak menemukan rekomendasi alternatif yang kuat (probabilitas > 5%).</p>';
        return;
    }

    alternatives.forEach(alt => {
        const item = document.createElement('div');
        item.className = 'alternative-card';
        // alt berisi "Nama Penawaran (XX.X%)"
        item.innerHTML = `
            <h4>${alt.split(' (')[0]}</h4>
            <span class="alt-prob">${alt.split(' (')[1]}</span>
            <p>Opsi bagus berdasarkan perilaku serupa.</p>
        `;
        alternativesContainer.appendChild(item);
    });
}