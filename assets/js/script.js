// SmartTelco-FrontEnd/assets/js/script.js

// Alamat API Backend (Pastikan sama dengan port Flask kamu)
const API_URL = 'http://127.0.0.1:5000/api'; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recommendation-form');
    
    // Fungsi untuk mengupdate nilai slider secara real-time
    const setupSlider = (id, displayId, unit, formatter = (v) => v) => {
        const range = document.getElementById(id);
        const display = document.getElementById(displayId);
        
        if (range && display) {
            // Inisialisasi nilai awal
            display.textContent = formatter(range.value) + unit;
            
            range.addEventListener('input', (e) => {
                display.textContent = formatter(e.target.value) + unit;
            });
        }
    };
    
    // Setup semua slider
    setupSlider('avg_data_usage_gb', 'data-value', ' GB', parseFloat);
    setupSlider('monthly_spend', 'spend-value', '.000', (v) => `Rp ${v}`);
    setupSlider('pct_video_usage', 'video-value', '%', (v) => (parseFloat(v) * 100).toFixed(0));
    setupSlider('avg_call_duration', 'call-value', ' Min', parseFloat);
    setupSlider('sms_freq', 'sms-value', '');
    setupSlider('topup_freq', 'topup-value', 'x');
    setupSlider('travel_score', 'travel-value', '', parseFloat);

    // Menangani Submit Form
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Ambil semua data input dari form
            const inputData = {
                plan_type: document.getElementById('plan_type').value,
                device_brand: document.getElementById('device_brand').value,
                avg_data_usage_gb: parseFloat(document.getElementById('avg_data_usage_gb').value),
                pct_video_usage: parseFloat(document.getElementById('pct_video_usage').value),
                avg_call_duration: parseFloat(document.getElementById('avg_call_duration').value),
                sms_freq: parseInt(document.getElementById('sms_freq').value),
                monthly_spend: parseFloat(document.getElementById('monthly_spend').value) * 1000, // Konversi ke Rp
                topup_freq: parseInt(document.getElementById('topup_freq').value),
                travel_score: parseFloat(document.getElementById('travel_score').value),
                complaint_count: parseInt(document.getElementById('complaint_count').value),
            };

            try {
                // 2. Kirim data ke API Backend
                const response = await fetch(`${API_URL}/recommend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputData),
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    // 3. Simpan hasil dan redirect
                    localStorage.setItem('recommendationResult', JSON.stringify(result));
                    // Simpan input data untuk ditampilkan di result.html
                    localStorage.setItem('customerInput', JSON.stringify(inputData)); 
                    window.location.href = 'result.html';
                } else {
                    alert(`Gagal mendapatkan rekomendasi: ${result.error || 'Terjadi kesalahan.'}`);
                }
            } catch (error) {
                console.error('Error saat koneksi ke API:', error);
                alert('Tidak dapat terhubung ke server backend atau terjadi kesalahan jaringan.');
            }
        });
    }
});

// Fungsi untuk simulasi login/load profil (diakses dari onclick di HTML)
window.loadCustomerProfile = async () => {
    const customerId = document.getElementById('customer-id').value.trim();
    const statusText = document.getElementById('profile-status');
    
    if (!customerId) {
        statusText.textContent = "Masukkan Customer ID!";
        statusText.style.color = '#dc3545'; // Error color
        return;
    }
    
    statusText.textContent = "Mencari profil...";
    statusText.style.color = '#ffc107'; // Warning color

    try {
        const response = await fetch(`${API_URL}/profile/${customerId}`);
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            const profile = result.profile;
            
            // 1. Isi form dengan data yang didapat
            document.getElementById('plan_type').value = profile.plan_type;
            document.getElementById('device_brand').value = profile.device_brand || 'Lainnya'; // Fallback
            document.getElementById('avg_data_usage_gb').value = profile.avg_data_usage_gb.toFixed(1);
            document.getElementById('monthly_spend').value = (profile.monthly_spend / 1000).toFixed(0);
            document.getElementById('pct_video_usage').value = profile.pct_video_usage.toFixed(2);
            document.getElementById('avg_call_duration').value = profile.avg_call_duration.toFixed(1);
            document.getElementById('sms_freq').value = profile.sms_freq;
            document.getElementById('topup_freq').value = profile.topup_freq;
            document.getElementById('travel_score').value = profile.travel_score.toFixed(2);
            document.getElementById('complaint_count').value = profile.complaint_count;

            // 2. Update display values setelah form diisi
            // Panggil kembali setupSlider agar display text (span) terupdate
            document.dispatchEvent(new Event('DOMContentLoaded')); 
            
            statusText.textContent = `Profil ${customerId} berhasil dimuat! Lakukan prediksi di bawah.`;
            statusText.style.color = '#28a745'; // Success color
        } else {
            statusText.textContent = `ID tidak ditemukan atau ${result.error}`;
            statusText.style.color = '#dc3545'; // Error color
        }
    } catch (error) {
        console.error('Error saat memuat profil:', error);
        statusText.textContent = "Gagal terhubung ke server data. Coba input manual.";
        statusText.style.color = '#dc3545';
    }
}