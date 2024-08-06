'use client';

import React, { useState, useEffect } from 'react';
import { getAINews, NewsItem } from '../services/newsApiService';

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const articles = await getAINews();
        setNews(articles);
        setError(null);
      } catch (err) {
        setError('Failed to fetch AI news.');
        console.error('Error fetching AI news:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    const intervalId = setInterval(fetchNews, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="bg-white shadow-md rounded-lg p-4 animate-pulse">Loading AI news...</div>;
  }

  if (error) {
    return <div className="bg-white shadow-md rounded-lg p-4 text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">AI News</h2>
      <ul className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {news.map((item, index) => (
          <li key={index} className="border-b pb-3">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline font-semibold"
            >
              {item.title}
            </a>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            <div className="text-xs text-gray-400 mt-1">
              {item.source.name} • {new Date(item.publishedAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}