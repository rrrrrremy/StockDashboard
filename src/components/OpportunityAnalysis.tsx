'use client';

import React, { useState, useEffect } from 'react';
import { getAIStocksData, StockOpportunity } from '../services/stockService';
import StockOpportunityCard from './StockOpportunityCard';

export default function OpportunityAnalysis() {
  const [opportunities, setOpportunities] = useState<StockOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setLoading(true);
        const data = await getAIStocksData();
        if (!data || data.length === 0) {
          throw new Error('No stock data received');
        }
        
        // Sort stocks by percentage change from high, descending (biggest losses first)
        const sortedOpportunities = data.sort((a, b) => 
          (a.percentFromHigh || 0) - (b.percentFromHigh || 0)
        );
        
        setOpportunities(sortedOpportunities);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch stock opportunities.');
        console.error('Error fetching stock opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
    const intervalId = setInterval(fetchOpportunities, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI Stock Opportunities</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI Stock Opportunities</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">AI Stock Opportunities</h2>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {opportunities.map(opportunity => (
          <StockOpportunityCard key={opportunity.symbol} opportunity={opportunity} />
        ))}
      </div>
    </div>
  );
}