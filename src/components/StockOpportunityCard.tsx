import React from 'react';
import { TrendingDownIcon, NewspaperIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import { StockOpportunity } from '../services/stockService';
import { InsiderSentiment } from '../services/finnhubService';

interface StockOpportunityCardProps {
  opportunity: StockOpportunity;
}

const StockOpportunityCard: React.FC<StockOpportunityCardProps> = ({ opportunity }) => {
  const percentChange = opportunity.percentFromHigh || 0;
  const sentiment = opportunity.insiderSentiment;

  const getSentimentColor = (mspr: number) => {
    if (mspr > 0.5) return 'bg-green-500';
    if (mspr > 0) return 'bg-green-300';
    if (mspr === 0) return 'bg-gray-300';
    if (mspr > -0.5) return 'bg-red-300';
    return 'bg-red-500';
  };

  const getSentimentLabel = (mspr: number) => {
    if (mspr > 0.5) return 'Very Positive';
    if (mspr > 0) return 'Positive';
    if (mspr === 0) return 'Neutral';
    if (mspr > -0.5) return 'Negative';
    return 'Very Negative';
  };

  const formatSentimentDate = (sentiment: InsiderSentiment | null) => {
    if (!sentiment) return 'N/A';
    const date = new Date(sentiment.year, sentiment.month - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-800">{opportunity.symbol}</h3>
          <div className="flex items-center bg-red-100 px-2 py-1 rounded">
            <TrendingDownIcon className="h-4 w-4 mr-1 text-red-500" />
            <span className="text-sm font-bold text-red-500">
              {Math.abs(percentChange).toFixed(2)}% from high
            </span>
          </div>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-sm text-gray-500">Current Price</span>
            <p className="text-2xl font-bold text-gray-800">
              ${opportunity.currentPrice?.toFixed(2) ?? 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">52-Week High</span>
            <p className="text-lg font-semibold text-gray-600">
              ${opportunity.allTimeHigh?.toFixed(2) ?? 'N/A'}
            </p>
          </div>
        </div>
        <div className="bg-gray-100 rounded p-2 mb-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Insider Sentiment:</span>
            {sentiment ? (
              <div className="flex items-center">
                <span className="text-xs mr-1 font-medium">{formatSentimentDate(sentiment)}</span>
                <div className={`w-3 h-3 rounded-full mr-1 ${getSentimentColor(sentiment.mspr)}`}></div>
                <span className="text-xs font-medium">{getSentimentLabel(sentiment.mspr)}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1 text-yellow-500" />
                No data available
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <h4 className="text-sm font-semibold mb-1 flex items-center">
            <NewspaperIcon className="h-4 w-4 mr-1 text-blue-500" />
            Most Relevant News
          </h4>
          {opportunity.news ? (
            <div>
              <a 
                href={opportunity.news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-medium block mb-1"
              >
                {opportunity.news.title}
              </a>
              <p className="text-xs text-gray-600 line-clamp-2">{opportunity.news.description}</p>
              <div className="flex justify-between items-center mt-1 text-xs">
                <span className="text-gray-500">
                  {opportunity.news.source.name} • {new Date(opportunity.news.publishedAt).toLocaleDateString()}
                </span>
                <span className="font-semibold text-green-600">
                  Relevance: {opportunity.news.relevanceScore.toFixed(1)}
                </span>
              </div>
              <div className="text-xxs text-gray-400 mt-1">
                News last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1 text-yellow-500" />
              No relevant news available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockOpportunityCard;