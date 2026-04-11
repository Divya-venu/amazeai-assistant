import sys
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def forecast_sales():
    try:
        # 1. Read input from Node.js (via stdin)
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return

        raw_data = json.loads(input_data)
        
        # Expected input: [{"date": "2026-03-01", "revenue": 1200}, ...]
        if not raw_data or len(raw_data) < 2:
            print(json.dumps({"error": "Insufficient data. Need at least 2 days of history."}))
            return

        # 2. Prepare Data
        df = pd.DataFrame(raw_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # Convert dates to ordinal (numbers) for regression
        # Scikit-learn models require numeric inputs
        df['date_ordinal'] = df['date'].map(datetime.toordinal)

        X = df[['date_ordinal']].values  # Independent variable (Date)
        y = df['revenue'].values        # Dependent variable (Revenue)

        # 3. Train Model (Linear Regression)
        model = LinearRegression()
        model.fit(X, y)

        # 4. Predict Next 7 Days
        last_date = df['date'].iloc[-1]
        predictions = []

        for i in range(1, 8):
            next_date = last_date + timedelta(days=i)
            next_ordinal = next_date.toordinal()
            
            # Predict for the numeric date
            pred_revenue = model.predict([[next_ordinal]])[0]
            
            predictions.append({
                "date": next_date.strftime('%Y-%m-%d'),
                "predictedRevenue": round(max(0, pred_revenue), 2)
            })

        # 5. Output Result to Node.js (via stdout)
        output = {
            "status": "success",
            "forecast": predictions,
            "metrics": {
                "r2_score": round(model.score(X, y), 4),
                "slope": round(model.coef_[0], 2)
            }
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    forecast_sales()
