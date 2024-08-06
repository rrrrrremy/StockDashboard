import React from 'react';
import { StockData } from '../services/finnhubService';
import { NewsItem } from '../services/newsApiService';
import { StockOpportunity } from '../services/stockService';
interface NewsItemProps {
  item: NewsItemType;
}

const NewsItem: React.FC<NewsItemProps> = ({ item }) => {
  return (
    <div className="mb-4">
      <a 
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-md text-blue-600 hover:underline font-semibold"
      >
        {item.headline}
      </a>
      <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
      <p className="text-xs text-gray-500 mt-1">
        {item.source} • {new Date(item.datetime * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default NewsItem;