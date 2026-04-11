import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
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
  Filler,
  Legend
);

const MonthlyProfitChart = ({ data, schemaMeta }) => {
    // Determine which metric to show. Default to primaryMetric if available, fallback to first metric.
    const primaryMetric = schemaMeta?.primaryMetric || schemaMeta?.metrics?.[0] || 'revenue';
    const label = primaryMetric.replace(/([A-Z])/g, ' $1').toUpperCase();

    // Heuristic to check if it's a currency metric
    const isCurrency = (m) => /revenue|price|cost|spend|amount|profit/i.test(m);

    const chartData = {
        labels: data?.length ? data.map(d => d.month) : ['-', '-', '-', '-'],
        datasets: [
            {
                fill: true,
                label: label,
                data: data?.length ? data.map(d => d[primaryMetric] || 0) : [0, 0, 0, 0],
                borderColor: '#8b5cf6', // purple glow
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                    return gradient;
                },
                tension: 0.4, // smooth glowing line
                pointRadius: data?.length === 1 ? 6 : 0, 
                pointHoverRadius: 6,
                borderWidth: 4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#a78bfa',
                borderColor: '#374151',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        let val = context.parsed.y || 0;
                        if (isCurrency(primaryMetric)) {
                            return `${label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)}`;
                        }
                        return `${label}: ${val.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 12 }
                }
            },
            y: {
                grid: {
                    color: '#374151',
                    drawBorder: false,
                    tickLength: 0
                },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 12 },
                    callback: function(value) {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                        return value;
                    }
                }
            }
        }
    };

    return (
        <div className="p-4 h-[350px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                {label} Trend
            </h3>
            <div className="w-full h-[90%] relative">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default MonthlyProfitChart;
