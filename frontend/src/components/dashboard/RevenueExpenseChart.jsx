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

const COLOR_PALETTE = ['#3b82f6', '#f97316', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

const RevenueExpenseChart = ({ data, schemaMeta }) => {
    // Show top 2-3 metrics for comparison
    const metricsToShow = schemaMeta?.metrics?.slice(0, 3) || ['revenue', 'expenses'];

    // Heuristic to check if it's a currency metric
    const isCurrency = (m) => /revenue|price|cost|spend|amount|profit/i.test(m);

    const chartData = {
        labels: data?.length ? data.map(d => d.month) : ['-', '-', '-', '-'],
        datasets: metricsToShow.map((metric, index) => ({
            label: metric.replace(/([A-Z])/g, ' $1').toUpperCase(),
            data: data?.length ? data.map(d => d[metric] || 0) : [0, 0, 0, 0],
            borderColor: COLOR_PALETTE[index % COLOR_PALETTE.length],
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: data?.length === 1 ? 5 : 0,
            pointHoverRadius: 5
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#9ca3af',
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                    font: { size: 11, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const val = context.parsed.y || 0;
                        const metricKey = metricsToShow[context.datasetIndex];
                        
                        if (isCurrency(metricKey)) {
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
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Multi-Metric Comparison
            </h3>
            <div className="w-full h-[90%] relative">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default RevenueExpenseChart;
