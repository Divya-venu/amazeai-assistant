import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ForecastChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-500 text-sm">Not enough data for forecasting.</div>;
    }

    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Predicted Revenue',
                data: data.map(d => d.expectedRevenue),
                borderColor: '#8b5cf6', // Violet
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: '#8b5cf6',
                borderWidth: 2,
                borderDash: [5, 5] // Dashed line for predictions
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: { color: '#9ca3af' }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#8b5cf6',
                borderColor: '#374151',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 10 } }
            },
            y: {
                grid: { color: '#374151', drawBorder: false },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 12 },
                    callback: function(value) { return '$' + value; }
                }
            }
        }
    };

    return (
        <div className="p-4 h-[350px]">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">30-Day Revenue Forecast (AI)</h3>
            <div className="w-full h-[85%] relative">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default ForecastChart;
