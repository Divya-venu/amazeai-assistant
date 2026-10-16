import React from 'react';
import AdvancedPredictions from '../components/dashboard/AdvancedPredictions';

const PredictionsPage = () => {
    return (
        <div className="p-6 max-w-screen-2xl mx-auto">

            <div className="mb-6">
                <h1 className="text-2xl font-black text-white">
                    Market Predictions
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    AI-powered revenue and demand forecasting based on your business data.
                </p>
            </div>

            <AdvancedPredictions />

        </div>
    );
};

export default PredictionsPage;