import React from 'react';
import { NewsItem as NewsItemType } from '../services/newsApiService';

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
        {item.headline || item.title}
      </a>
      <p className="text-sm text-gray-600 mt-1">{item.summary || item.description}</p>
      <p className="text-xs text-gray-500 mt-1">
        {item.source.name} • {new Date((item.datetime || Date.now()) * 1000).toLocaleString()}
      </p>
    </div>
  );
};

export default NewsItem;