import React from 'react';
import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/solid';
import { StockData } from '../services/finnhubService';
import { NewsItem } from '../services/newsApiService';
import { StockOpportunity } from '../services/stockService';

interface ExtendedStockData extends StockData {
  lastUpdated: Date;
  error?: string;
}

interface StockTileProps {
  stock: ExtendedStockData;
}

const formatPrice = (price: number | null): string => {
  return price !== null ? price.toFixed(2) : 'N/A';
};

const formatPercent = (percent: number | null): string => {
  return percent !== null ? percent.toFixed(2) + '%' : 'N/A';
};

const StockTile: React.FC<StockTileProps> = ({ stock }) => (
  <div className="bg-gray-50 rounded-lg p-3 shadow transition-all duration-300 hover:shadow-md w-40">
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-sm font-bold text-gray-700">{stock.symbol}</h3>
      {stock.percentFromHigh !== null && (
        <span className={`text-xs font-semibold ${stock.percentFromHigh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stock.percentFromHigh >= 0 ? (
            <ArrowSmUpIcon className="h-4 w-4 inline" />
          ) : (
            <ArrowSmDownIcon className="h-4 w-4 inline" />
          )}
          {formatPercent(Math.abs(stock.percentFromHigh))}
        </span>
      )}
    </div>
    {stock.currentPrice !== null ? (
      <div className="text-lg font-bold text-gray-900">${formatPrice(stock.currentPrice)}</div>
    ) : (
      <div className="animate-pulse h-6 bg-gray-200 rounded w-3/4"></div>
    )}
  </div>
);

export default StockTile;