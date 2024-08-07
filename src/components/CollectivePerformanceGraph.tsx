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
import { getAIStocksData } from '../services/stockService';

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
    const fetchAndUpdateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current stock data
        const stocksData = await getAIStocksData();
        const totalValue = stocksData.reduce((sum, stock) => sum + (stock.currentPrice || 0), 0);
        const currentDate = new Date().toISOString().split('T')[0];

        // Fetch historical data
        const response = await axios.get<{ data: HistoricalDataPoint[] }>('/historical_data.json');
        let historicalData = response.data.data;

        // Check if we need to add a new data point
        if (historicalData.length === 0 || historicalData[historicalData.length - 1].date !== currentDate) {
          historicalData.push({
            date: currentDate,
            value: totalValue
          });

          // Keep only the last 30 days of data
          if (historicalData.length > 30) {
            historicalData = historicalData.slice(-30);
          }

          // Save updated historical data
          await axios.post('/api/update-historical-data', { data: historicalData });
        }

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
        console.error('Error fetching or updating data:', err);
        setError('Failed to load or update chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndUpdateData();
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