# SmartTelco-BackEnd/utils/preprocessing.py

import pandas as pd
import numpy as np

# --- 1. Definisi Konstanta Fitur (DIKOREKSI AGAR 15 FITUR) ---

# Label Target Offer (Tetap sama)
TARGET_LABELS = [
    'Data Booster', 'Device Upgrade Offer', 'General Offer', 
    'Retention Offer', 'Roaming Pass', 'Streaming Partner Pack', 
    'Top-up Promo', 'Voice Bundle', '!!! OFFER TAK DIKENAL !!!'
]

# 7 Merek Perangkat yang diakui model (6 kolom OHE + 1 Base Brand/Drop)
ALLOWED_DEVICE_BRANDS = [
    'Apple', 'Huawei', 'Oppo', 'Realme', 'Samsung', 'Vivo', 'Xiaomi' 
] 
# Kita asumsikan 'Apple' adalah base brand yang di-drop, karena ia umum.

# DAFTAR AKHIR FITUR (WAJIB 15 KOLOM) - SAMA PERSIS DENGAN DAFTAR MODEL KAMU!
FEATURE_COLS = [
    'avg_data_usage_gb', 
    'pct_video_usage', 
    'avg_call_duration', 
    'sms_freq', 
    'monthly_spend', 
    'topup_freq', 
    'travel_score', 
    'complaint_count',
    'plan_type_Prepaid', 
    'device_brand_Huawei', 
    'device_brand_Oppo', 
    'device_brand_Realme', 
    'device_brand_Samsung', 
    'device_brand_Vivo', 
    'device_brand_Xiaomi'
]


def preprocess_data(input_data: dict) -> np.ndarray:
    """
    Mengubah input data pelanggan dari frontend menjadi format array NumPy
    yang siap dimasukkan ke dalam model ML, dengan memastikan 15 fitur.
    """
    
    # 1. Konversi dictionary input ke DataFrame satu baris
    df = pd.DataFrame([input_data])
    
    # 2. Penanganan Kategori Device Brand (PENTING!)
    # Jika inputan dari frontend (misal: 'Nokia' atau 'Lainnya') tidak ada di ALLOWED_DEVICE_BRANDS,
    # kita paksa kategorinya menjadi 'Apple' (Base Brand yang akan di-drop/dijadikan 0 di semua kolom OHE).
    df['device_brand'] = df['device_brand'].apply(
        lambda x: x if x in ALLOWED_DEVICE_BRANDS else 'Apple'
    )
    
    # 3. One-Hot Encoding (OHE) dengan drop_first=True
    
    # Plan Type (Menghasilkan 1 kolom: plan_type_Prepaid)
    df_plan = pd.get_dummies(df['plan_type'], prefix='plan_type', drop_first=True)
    df = pd.concat([df, df_plan], axis=1)
    df.drop('plan_type', axis=1, inplace=True)
    
    # Device Brand (Menghasilkan 6 kolom, karena 'Apple' di-drop)
    df_brand = pd.get_dummies(df['device_brand'], prefix='device_brand', drop_first=True)
    df = pd.concat([df, df_brand], axis=1)
    df.drop('device_brand', axis=1, inplace=True)
    
    
    # 4. Menambahkan kolom OHE yang hilang (Ini menjamin 15 kolom selalu ada)
    for col in FEATURE_COLS:
        if col not in df.columns:
            df[col] = 0
            
    # 5. Memastikan urutan kolom SAMA PERSIS dengan FEATURE_COLS (KRUSIAL)
    final_features = df[FEATURE_COLS]
    
    # 6. Konversi ke array numpy dan kembalikan
    return final_features.values