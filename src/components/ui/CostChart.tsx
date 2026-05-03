"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CostChartProps {
  days: {
    dayNumber: number;
    activities: { name: string; estimatedCost: string }[];
  }[];
}

export default function CostChart({ days }: CostChartProps) {
  // Extract numeric values from strings like "$20" or "£15"
  const parseCost = (costStr: string) => {
    const num = parseFloat(costStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const labels = days.map(day => `Day ${day.dayNumber}`);
  const dataPoints = days.map(day => {
    return day.activities.reduce((total, activity) => total + parseCost(activity.estimatedCost), 0);
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Cost (Estimated)',
        data: dataPoints,
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Primary blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af', // gray-400
        }
      },
      title: {
        display: true,
        text: 'Estimated Daily Expenses',
        color: '#f3f4f6', // gray-100
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#374151' }, // gray-700
        ticks: { color: '#9ca3af' } // gray-400
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' } // gray-400
      }
    }
  };

  return (
    <div className="h-64 sm:h-80 w-full bg-surface border border-border p-4 rounded-2xl shadow-lg mt-8">
      <Bar data={data} options={options} />
    </div>
  );
}
