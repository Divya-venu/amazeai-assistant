import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prophet import Prophet
import io
import json
from datetime import datetime, timedelta

app = FastAPI(title="AI BI ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_anomalies(df):
    """Simple Z-score anomaly detection on revenue."""
    mean = df['revenue'].mean()
    std = df['revenue'].std()
    threshold = 2  # 2 standard deviations
    
    anomalies = df[np.abs(df['revenue'] - mean) > threshold * std]
    return anomalies.to_dict('records')

@app.post("/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Ensure required columns
        required = ['date', 'revenue', 'expenses', 'category', 'product']
        if not all(col in df.columns for col in required):
            # Try to map columns if they are slightly different
            raise HTTPException(status_code=400, detail=f"CSV must contain: {required}")
            
        df['date'] = pd.to_datetime(df['date'])
        
        # 1. Basic Stats
        total_revenue = float(df['revenue'].sum())
        total_expenses = float(df['expenses'].sum())
        net_profit = total_revenue - total_expenses
        profit_margin = (net_profit / total_revenue) * 100 if total_revenue > 0 else 0
        
        # 2. Category Performance
        cat_perf = df.groupby('category')['revenue'].sum().sort_values(ascending=False).to_dict()
        
        # 3. Anomalies
        anomalies = detect_anomalies(df)
        
        # 4. Prophet Forecast
        forecast_df = df.groupby('date')['revenue'].sum().reset_index()
        forecast_df.columns = ['ds', 'y']
        
        model = Prophet(yearly_seasonality=True, daily_seasonality=False)
        model.fit(forecast_df)
        
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)
        
        # Format forecast for Recharts
        predicted_data = forecast[['ds', 'yhat']].tail(30).to_dict('records')
        # Convert timestamps to strings for JSON
        for item in predicted_data:
            item['ds'] = item['ds'].strftime('%Y-%m-%d')
            item['revenue'] = float(item['yhat'])
            del item['yhat']

        # 5. Natural Language Insights
        top_cat = list(cat_perf.keys())[0]
        insight = f"Total revenue reached ${total_revenue:,.2f}. The top performing category is {top_cat}. "
        if len(anomalies) > 0:
            insight += f"Detected {len(anomalies)} revenue anomalies requiring attention."
        else:
            insight += "Revenue trends appear stable with no major anomalies detected."

        return {
            "stats": {
                "totalRevenue": total_revenue,
                "totalExpenses": total_expenses,
                "netProfit": net_profit,
                "profitMargin": profit_margin
            },
            "categories": cat_perf,
            "anomalies": anomalies,
            "forecast": predicted_data,
            "insights": insight,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
