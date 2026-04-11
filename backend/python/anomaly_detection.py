import sys
import json
import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np

def detect_anomalies():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        data = json.loads(input_data)
        
        # Expecting data format: [{"date": "2026-01-01", "amount": 100, "category": "Marketing"}, ...]
        if not data or len(data) < 5:
            # Not enough data for Isolation Forest to be meaningful
            print(json.dumps({"anomalies": []}))
            return

        df = pd.DataFrame(data)
        
        # We need a numeric column for anomaly detection. 
        # For business context, 'amount' or 'revenue' or 'price' are common.
        # Let's try to find a suitable numeric column.
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if not numeric_cols:
            print(json.dumps({"error": "No numeric data found for anomaly detection"}))
            return

        # Use the first numeric column for simplicity, or specific ones if identified
        # For this specific app, let's look for 'amount', 'revenue', or just the first numeric col.
        target_col = None
        for col in ['amount', 'revenue', 'price', 'total']:
            if col in numeric_cols:
                target_col = col
                break
        
        if not target_col:
            target_col = numeric_cols[0]

        # Prepare for Isolation Forest
        X = df[[target_col]].values

        # Isolation Forest
        # contamination is the proportion of outliers in the data set. 
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(X)

        # Predict anomalies (-1 for anomaly, 1 for normal)
        df['anomaly_score'] = model.predict(X)
        
        anomalies_df = df[df['anomaly_score'] == -1]
        
        results = []
        for index, row in anomalies_df.iterrows():
            # Construct a human-readable message
            msg = f"{row.get('category', 'Activity')} of {row[target_col]} is unusual."
            if target_col == 'revenue' or target_col == 'price':
                 if row[target_col] < df[target_col].mean():
                     type_msg = "Abnormal Drop"
                     msg = f"{target_col.capitalize()} dropped to {row[target_col]}, significantly lower than average."
                 else:
                     type_msg = "Spike Detected"
                     msg = f"{target_col.capitalize()} increased to {row[target_col]}, significantly higher than average."
            else:
                type_msg = "Spike Detected"
                msg = f"{target_col.capitalize()} spike: {row[target_col]} detected."

            results.append({
                "date": row.get('date', 'Unknown Date'),
                "type": type_msg,
                "message": msg,
                "severity": "high" if abs(row[target_col] - df[target_col].mean()) > 2 * df[target_col].std() else "medium"
            })

        print(json.dumps({"anomalies": results}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    detect_anomalies()
