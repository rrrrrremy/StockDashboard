'use client';

import React, { useState, useEffect } from 'react';
import { getAIStocksData } from '../services/stockService';
import { StockData } from '../services/finnhubService';
import { TrendingDownIcon, TrendingUpIcon } from '@heroicons/react/solid';
import { ALL_STOCKS } from './stockCategories';

interface ExtendedStockData extends StockData {
  lastUpdated: Date;
  error?: string;
}

export default function StockList() {
  const [stocks, setStocks] = useState<ExtendedStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      setLoading(true);
      const currentTime = new Date();
      setLastFetchTime(currentTime);

      try {
        const stocksData = await getAIStocksData();
        if (!stocksData || stocksData.length === 0) {
          throw new Error('No stock data received');
        }
        const updatedStocks = stocksData.map(stock => ({
          ...stock,
          lastUpdated: currentTime
        }));
        setStocks(updatedStocks);
        setError(null);
      } catch (err) {
        setError('Failed to fetch stock data. Will retry soon.');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();

    const intervalId = setInterval(fetchStockData, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="bg-white shadow-md rounded-lg p-4 animate-pulse">Loading stocks...</div>;
  }

  if (error) {
    return <div className="bg-white shadow-md rounded-lg p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">AI and Tech Stocks</h2>
      <div className="relative w-full overflow-hidden" style={{ height: '120px' }}>
        <div className="flex absolute animate-scroll">
          {[...stocks, ...stocks].map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 shadow mx-2" style={{ width: '200px' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-bold text-gray-800">{stock.symbol}</div>
                {stock.percentFromHigh !== null && (
                  <div className="flex items-center bg-red-100 px-2 py-1 rounded">
                    <TrendingDownIcon className="h-3 w-3 mr-1 text-red-500" />
                    <span className="text-xs font-bold text-red-500">
                      {Math.abs(stock.percentFromHigh).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              {stock.currentPrice !== null ? (
                <div className="text-xl font-bold text-gray-900">${stock.currentPrice.toFixed(2)}</div>
              ) : (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-3/4"></div>
              )}
              {stock.allTimeHigh !== null && (
                <div className="text-xs text-gray-500 mt-1">
                  52W High: ${stock.allTimeHigh.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {lastFetchTime && (
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {lastFetchTime.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}