# SmartTelco-BackEnd/app.py

import os
import pandas as pd
import joblib 
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS # Wajib untuk menghubungkan frontend dan backend
from dotenv import load_dotenv

# Impor fungsi preprocessing dan konstanta
from utils.preprocessing import preprocess_data, TARGET_LABELS

# --- 1. Setup Dasar ---
load_dotenv()
app = Flask(__name__)
# Mengizinkan akses dari frontend (http://127.0.0.1:5000)
CORS(app) 

# --- 2. Muat Model dan Data ---
MODEL_PATH = 'xgboost_smote_telco.pkl' # Nama model yang kamu kirim
DATA_PATH = 'data_telco.csv' # Nama dataset yang kamu rename

model = None
df_data = None

try:
    # Muat Model
    model = joblib.load(MODEL_PATH) 
    print(f"[STATUS] Model ML ({MODEL_PATH}) berhasil dimuat.")
    
    # Muat Dataset (untuk simulasi profile)
    df_data = pd.read_csv(DATA_PATH) 
    # Ubah ID menjadi string untuk kemudahan pencarian
    df_data['customer_id'] = df_data['customer_id'].astype(str)
    print(f"[STATUS] Dataset ({DATA_PATH}) berhasil dimuat.")
    
except FileNotFoundError as e:
    print(f"[ERROR] File tidak ditemukan: {e}")
except Exception as e:
    print(f"[ERROR] Error saat memuat: {e}")

# 3. Endpoint API Rekomendasi
@app.route('/api/recommend', methods=['POST'])
def recommend_offer():
    if model is None:
        return jsonify({"error": "Model tidak tersedia di server."}), 500
        
    try:
        data = request.json
        processed_data = preprocess_data(data) 
        
        # 1. Prediksi Probabilitas
        proba = model.predict_proba(processed_data)
        
        # Pastikan output proba adalah 2D array (1 baris x N_CLASSES)
        if proba.ndim == 2:
            proba_flat = proba[0]
        else:
            proba_flat = proba

        print(f"DEBUG: Panjang TARGET_LABELS: {len(TARGET_LABELS)}")
            
        # 2. Ambil Indeks Rekomendasi Utama (Indeks dengan probabilitas tertinggi)
        prediction_index = np.argmax(proba_flat)
        print(f"DEBUG: Indeks Prediksi dari Model: {prediction_index}")
        recommended_offer = TARGET_LABELS[prediction_index]
        
        # 3. Dapatkan probabilitas untuk alternatif
        top_indices = np.argsort(proba_flat)[::-1] # Urutkan dari probabilitas tertinggi
        
        # Buat daftar rekomendasi alternatif (selain yang pertama)
        alternatives = []
        for i in range(1, min(len(top_indices), 3)): # Ambil 2 alternatif teratas
            alt_index = top_indices[i]
            alt_offer = TARGET_LABELS[alt_index]
            alt_prob = proba_flat[alt_index] * 100
            
            # Hanya masukkan jika probabilitasnya cukup signifikan
            if alt_prob > 5: 
                 alternatives.append(f"{alt_offer} ({alt_prob:.1f}%)")

        # Kembalikan hasil ke frontend
        return jsonify({
            "status": "success",
            "recommended_offer": recommended_offer,
            # Tingkat kepercayaan dari probabilitas tertinggi
            "confidence": f"{proba_flat[prediction_index] * 100:.2f}%", 
            "alternatives": alternatives
        })
        
    except Exception as e:
        # Tambahkan detail error untuk debugging
        print(f"[ERROR] Error saat prediksi: {str(e)}") 
        return jsonify({"error": f"Gagal memproses data atau memprediksi. Pastikan semua input diisi dengan benar. Detail: {str(e)}"}), 400

# --- 4. Endpoint Simulasi Login Pelanggan ---
@app.route('/api/profile/<customer_id>', methods=['GET'])
def get_customer_profile(customer_id):
    if df_data is None:
        return jsonify({"error": "Data tidak tersedia."}), 500
        
    # Cari data pelanggan
    customer_data = df_data[df_data['customer_id'] == customer_id]
    
    if customer_data.empty:
        return jsonify({"error": "Customer ID tidak ditemukan di data historis."}), 404
        
    profile = customer_data.iloc[0].to_dict()
    
    # Hapus kolom yang tidak relevan untuk form input
    profile.pop('target_offer', None)
    profile.pop('customer_id', None) 
    
    return jsonify({
        "status": "success",
        "profile": profile
    })

# --- 5. Jalankan Server ---
if __name__ == '__main__':
    # Pastikan file model dan data sudah berada di folder yang benar
    if not os.path.exists(MODEL_PATH) or not os.path.exists(DATA_PATH):
         print(f"!!! PERHATIAN: Pastikan {MODEL_PATH} dan {DATA_PATH} sudah ada di folder ini. !!!")

    app.run(debug=True, port=5000)