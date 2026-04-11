import sys
import json
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def forecast():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data or not input_data.strip():
            print(json.dumps({"error": "No input data provided"}))
            sys.stdout.flush()
            return

        data = json.loads(input_data)

        # Expecting data format: [{"month_index": 1, "revenue": 100}, ...]
        if not data or len(data) < 2:
            print(json.dumps({"error": "Insufficient data points for forecasting. Need at least 2 rows."}))
            sys.stdout.flush()
            return

        df = pd.DataFrame(data)

        # Ensure we have the required columns
        if 'month_index' not in df.columns or 'revenue' not in df.columns:
            print(json.dumps({"error": "Missing required columns: month_index, revenue"}))
            sys.stdout.flush()
            return

        # Coerce revenue to numeric (CSV values often arrive as strings)
        df['month_index'] = pd.to_numeric(df['month_index'], errors='coerce')
        df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce')

        # Drop rows where coercion failed
        df = df.dropna(subset=['month_index', 'revenue'])

        if len(df) < 2:
            print(json.dumps({"error": "Dataset has fewer than 2 valid numeric rows after cleaning."}))
            sys.stdout.flush()
            return

        # Prepare features and target
        X = df[['month_index']].values
        y = df['revenue'].values

        # Train model
        model = LinearRegression()
        model.fit(X, y)

        # Predict next month
        last_index = int(X.max())
        next_month_index = np.array([[last_index + 1]])
        prediction = model.predict(next_month_index)[0]

        # Calculate growth %
        last_revenue = float(y[-1])
        growth = ((prediction - last_revenue) / last_revenue) * 100 if last_revenue != 0 else 0

        # Return result
        result = {
            "predictedRevenue": round(float(prediction), 2),
            "growth": round(float(growth), 2),
            "nextMonthIndex": last_index + 1
        }
        print(json.dumps(result))
        sys.stdout.flush()

    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()

if __name__ == "__main__":
    forecast()
