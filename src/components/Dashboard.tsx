'use client';

import React from 'react';
import StockList from './StockList';
import OpportunityAnalysis from './OpportunityAnalysis';
import BestOpportunity from './BestOpportunity';

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
    </div>
  );
}