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

interface StockChartProps {
  symbol: string;
}

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const toDate = Math.floor(Date.now() / 1000);
        const fromDate = toDate - 30 * 24 * 60 * 60; // 30 days ago

        const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
          params: {
            symbol,
            resolution: 'D',
            from: fromDate,
            to: toDate,
            token: FINNHUB_API_KEY
          }
        });

        if (response.data.s === 'ok') {
          const labels = response.data.t.map((timestamp: number) => 
            new Date(timestamp * 1000).toLocaleDateString()
          );

          setChartData({
            labels,
            datasets: [
              {
                label: symbol,
                data: response.data.c,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }
            ]
          });
        } else {
          throw new Error('Failed to fetch stock data');
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} Stock Price (Last 30 Days)`,
      },
    },
  };

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return null;

  return <Line options={options} data={chartData} />;
};

export default StockChart;