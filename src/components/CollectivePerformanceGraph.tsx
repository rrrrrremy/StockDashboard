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
import { ALL_STOCKS } from './stockCategories';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface StockData {
  symbol: string;
  data: number[];
}

const CollectivePerformanceGraph: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const toDate = Math.floor(Date.now() / 1000);
        const fromDate = toDate - 90 * 24 * 60 * 60; // 90 days ago

        const stockDataPromises = ALL_STOCKS.map(async (symbol) => {
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
            return {
              symbol,
              data: response.data.c.map((price: number, index: number) => 
                (price - response.data.c[0]) / response.data.c[0] * 100 // Percentage change
              )
            };
          }
          return null;
        });

        const stocksData = (await Promise.all(stockDataPromises)).filter((data): data is StockData => data !== null);

        const labels = [...Array(stocksData[0].data.length)].map((_, i) => 
          new Date(fromDate * 1000 + i * 24 * 60 * 60 * 1000).toLocaleDateString()
        );

        const averagePerformance = labels.map((_, i) => 
          stocksData.reduce((sum, stock) => sum + stock.data[i], 0) / stocksData.length
        );

        setChartData({
          labels,
          datasets: [
            {
              label: 'Average Performance',
              data: averagePerformance,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Collective Stock Performance (Last 90 Days)',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Percentage Change'
        },
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2) + '%';
          }
        }
      }
    }
  };

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return null;

  return <Line options={options} data={chartData} />;
};

export default CollectivePerformanceGraph;