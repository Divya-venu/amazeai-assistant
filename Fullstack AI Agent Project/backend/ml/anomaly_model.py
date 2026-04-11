import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_transaction_anomalies():
    try:
        # 1. Read input from Node.js
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        raw_data = json.loads(input_data)
        
        # Expected input: [{"amount": 120, "timestamp": "2026-03-13T10:00:00Z"}, ...]
        if not raw_data or len(raw_data) < 10:
            print(json.dumps({"anomalies": [], "message": "Need at least 10 transactions for reliable detection."}))
            return

        # 2. Feature Engineering
        df = pd.DataFrame(raw_data)
        
        # Convert timestamp to datetime if present
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour_of_day'] = df['timestamp'].dt.hour
            df['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # Ensure we have the required features
        required_features = ['amount', 'hour_of_day', 'day_of_week']
        for feat in required_features:
            if feat not in df.columns:
                # If missing, we might need to handle it or error out
                if feat == 'amount' and 'revenue' in df.columns:
                    df['amount'] = df['revenue']
                else:
                    print(json.dumps({"error": f"Missing required feature: {feat}"}))
                    return

        # 3. Train Isolation Forest
        # We use the three features to identify anomalies
        X = df[required_features].values
        
        # contamination=0.05 (5% outliers)
        model = IsolationForest(contamination=0.05, random_state=42)
        df['anomaly_score'] = model.predict(X)
        
        # 4. Format Results
        # -1 = anomaly
        anomalies_df = df[df['anomaly_score'] == -1]
        
        results = []
        for _, row in anomalies_df.iterrows():
            results.append({
                "transactionId": row.get('id', row.get('_id', 'N/A')),
                "amount": float(row['amount']),
                "hour": int(row['hour_of_day']),
                "day": int(row['day_of_week']),
                "type": "Unusual Transaction",
                "message": f"Transaction of ${row['amount']} at hour {row['hour_of_day']} is statistically abnormal."
            })

        # 5. Output JSON
        print(json.dumps({
            "status": "success",
            "anomalies": results,
            "metrics": {
                "totalTransactions": len(df),
                "anomalyCount": len(results),
                "contamination": 0.05
            }
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    detect_transaction_anomalies()
