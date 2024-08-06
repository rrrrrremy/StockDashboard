import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { getAIStocksData, StockOpportunity } from '../services/stockService';
import { TrendingDownIcon, LightningBoltIcon, ChartBarIcon, NewspaperIcon, BeakerIcon, ExclamationCircleIcon } from '@heroicons/react/solid';

interface AnalysisError {
  message: string;
  response?: {
    data: any;
    status: number;
    headers: Record<string, string>;
  };
  request?: any;
}

function isAnalysisError(error: unknown): error is AnalysisError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export default function BestOpportunity() {
  const [bestStock, setBestStock] = useState<StockOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setAnalysisError(null);

        // Fetch stock data
        const data = await getAIStocksData();
        if (!data || data.length === 0) {
          throw new Error('No stock data received');
        }

        const scoredStocks = data.map(stock => {
          const percentDownScore = stock.percentFromHigh ? Math.abs(stock.percentFromHigh) : 0;
          const sentimentScore = stock.insiderSentiment ? stock.insiderSentiment.mspr * 10 : 0;
          return {
            ...stock,
            score: percentDownScore + sentimentScore
          };
        });

        const topStock = scoredStocks.sort((a, b) => b.score - a.score)[0];
        setBestStock(topStock);

        // Fetch Claude's analysis only once
        try {
          console.log('Fetching Claude analysis for:', topStock.symbol);
          const analysisResponse = await axios.post('/api/claude-analysis', { stockData: topStock });
          console.log('Claude analysis response:', analysisResponse.data);
          setAnalysis(analysisResponse.data.analysis);
        } catch (analysisErr) {
          console.error('Error fetching analysis:', analysisErr);
          if (isAnalysisError(analysisErr)) {
            setAnalysisError({
              message: analysisErr.message,
              response: analysisErr.response,
              request: analysisErr.request
            });
          } else if (axios.isAxiosError(analysisErr)) {
            setAnalysisError({
              message: analysisErr.message,
              response: analysisErr.response,
              request: analysisErr.request
            });
          } else {
            setAnalysisError({
              message: 'An unknown error occurred while fetching the analysis.'
            });
          }
        }

      } catch (err) {
        setError('Failed to fetch best opportunity.');
        console.error('Error fetching best opportunity:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
 // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    // Set up interval to refresh stock data only (not AI analysis)
    const intervalId = setInterval(async () => {
      try {
        const data = await getAIStocksData();
        if (data && data.length > 0) {
          const scoredStocks = data.map(stock => {
            const percentDownScore = stock.percentFromHigh ? Math.abs(stock.percentFromHigh) : 0;
            const sentimentScore = stock.insiderSentiment ? stock.insiderSentiment.mspr * 10 : 0;
            return {
              ...stock,
              score: percentDownScore + sentimentScore
            };
          });
          const topStock = scoredStocks.sort((a, b) => b.score - a.score)[0];
          setBestStock(topStock);
        }
      } catch (err) {
        console.error('Error refreshing stock data:', err);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">Loading best opportunity...</div>;
  }

  if (error) {
    return <div className="bg-white shadow-md rounded-lg p-6 text-red-500">{error}</div>;
  }

  if (!bestStock) {
    return <div className="bg-white shadow-md rounded-lg p-6">No opportunity found at this time.</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg rounded-lg p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <LightningBoltIcon className="h-10 w-10 mr-3 text-yellow-300" />
        Best Investment Opportunity
      </h2>
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">{bestStock.symbol}</h3>
          <div className="flex items-center bg-red-500 bg-opacity-75 px-3 py-1 rounded-full">
            <TrendingDownIcon className="h-5 w-5 mr-1" />
            <span className="text-sm font-bold">
              {Math.abs(bestStock.percentFromHigh || 0).toFixed(2)}% from high
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm opacity-75">Current Price</span>
            <p className="text-3xl font-bold">
              ${bestStock.currentPrice?.toFixed(2) ?? 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm opacity-75">52-Week High</span>
            <p className="text-2xl font-semibold">
              ${bestStock.allTimeHigh?.toFixed(2) ?? 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 mr-2" />
          <span className="text-sm opacity-75 mr-2">Insider Sentiment:</span>
          <span className="text-lg font-semibold">
            {bestStock.insiderSentiment ? bestStock.insiderSentiment.mspr.toFixed(2) : 'N/A'}
          </span>
        </div>
        {bestStock.news && (
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <NewspaperIcon className="h-6 w-6 mr-2" />
              <span className="text-sm font-semibold">Latest News</span>
            </div>
            <a 
              href={bestStock.news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline block mt-1"
            >
              {bestStock.news.title}
            </a>
          </div>
        )}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <BeakerIcon className="h-6 w-6 mr-2" />
            <span className="text-sm font-semibold">AI Analysis</span>
          </div>
          {analysis ? (
            <p className="text-sm">{analysis}</p>
          ) : analysisError ? (
            <div className="text-yellow-300">
              <p className="text-sm font-semibold">Error fetching analysis:</p>
              <p className="text-xs">{analysisError.message}</p>
              {analysisError.response && (
                <div className="mt-2">
                  <p className="text-xs font-semibold">Response:</p>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(analysisError.response, null, 2)}
                  </pre>
                </div>
              )}
              {analysisError.request && (
                <p className="text-xs mt-2">{analysisError.request}</p>
              )}
            </div>
          ) : (
            <p className="text-sm">Loading analysis...</p>
          )}
        </div>
      </div>
    </div>
  );
}