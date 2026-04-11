import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import timedelta

app = FastAPI(title="AI Market Predictions Service")

class DataPoint(BaseModel):
    date: str
    revenue: float

class PredictionRequest(BaseModel):
    data: List[DataPoint]

class PredictionResponse(BaseModel):
    predictions: List[float]
    dates: List[str]
    trend: str
    growth: str
    confidence: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if len(request.data) < 2:
        raise HTTPException(status_code=400, detail="Insufficient data for prediction. Need at least 2 points.")

    try:
        # 1. Convert to DataFrame
        df = pd.DataFrame([{"date": d.date, "revenue": d.revenue} for d in request.data])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # 2. Feature Engineering: Days from start
        start_date = df['date'].min()
        df['days'] = (df['date'] - start_date).dt.days

        X = df[['days']].values
        y = df['revenue'].values

        # 3. Train Linear Regression Model
        model = LinearRegression()
        model.fit(X, y)

        # 4. Predict Next 7 Days
        last_day = df['days'].max()
        last_date = df['date'].max()
        
        future_days = np.array([[last_day + i + 1] for i in range(7)])
        predictions = model.predict(future_days)
        
        # Ensure predictions are non-negative
        predictions = [max(0, float(p)) for p in predictions]
        
        future_dates = [(last_date + timedelta(days=i + 1)).strftime('%Y-%m-%d') for i in range(7)]

        # 5. Trend & Stats
        slope = model.coef_[0]
        trend = "upward" if slope > 0 else "downward"
        
        # Growth calculation: (Avg Predicted / Last Actual - 1) * 100
        last_actual = y[-1]
        avg_predicted = np.mean(predictions)
        
        growth_val = ((avg_predicted / last_actual) - 1) * 100 if last_actual > 0 else 0
        growth_str = f"{'+' if growth_val >= 0 else ''}{growth_val:.1f}%"

        # Confidence: Use R^2 Score
        r2_score = model.score(X, y)
        confidence_pct = max(0, min(100, int(r2_score * 100)))
        
        # If R2 is very low, give a "baseline" confidence of 60% if trend is clear
        if confidence_pct < 60:
            confidence_pct = 60 + (confidence_pct // 4)

        return PredictionResponse(
            predictions=predictions,
            dates=future_dates,
            trend=trend,
            growth=growth_str,
            confidence=f"{confidence_pct}%"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
