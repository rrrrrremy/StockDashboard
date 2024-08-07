'use client';

import React from 'react';
import StockList from './StockList';
import OpportunityAnalysis from './OpportunityAnalysis';
import BestOpportunity from './BestOpportunity';
import CollectivePerformanceGraph from './CollectivePerformanceGraph';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StockList />
      <div className="mt-8">
        <BestOpportunity />
      </div>
      <div className="mt-8">
        <OpportunityAnalysis />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Collective Performance</h2>
        <CollectivePerformanceGraph />
      </div>
    </div>
  );
}