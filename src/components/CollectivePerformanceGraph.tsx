import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalDataPoint {
  date: string;
  value: number;
}

const CollectivePerformanceGraph: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<{ data: HistoricalDataPoint[] }>('/historical_data.json');
        const historicalData = response.data.data;

        setChartData({
          labels: historicalData.map(point => point.date),
          datasets: [
            {
              label: 'Collective Stock Value',
              data: historicalData.map(point => point.value),
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            }
          ]
        });
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Collective Stock Value Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Total Value ($)'
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
          }
        }
      }
    }
  };

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>No data available</div>;

  const latestValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];

  return (
    <div>
      <Line options={options} data={chartData} />
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          Latest Total Portfolio Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(latestValue)}
        </p>
      </div>
    </div>
  );
};

export default CollectivePerformanceGraph;