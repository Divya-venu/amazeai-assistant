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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastChart = ({ data }) => {
  if (!data) {
    return (
      <div className="h-[400px] bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-500">
        <TrendingUp size={48} className="mb-4 opacity-20" />
        <p className="font-medium text-sm">Upload data to generate AI Forecast</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Predicted Revenue',
        data: data.map(item => item.predictedRevenue || item.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[450px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            ML Sales Forecast
          </h3>
          <p className="text-slate-500 text-sm mt-1">Predictive analysis for the next 7 days</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
          <Clock size={12} />
          7-DAY MODEL
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ForecastChart;
