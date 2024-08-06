// src/app/portfolio/page.tsx
import React from 'react';

export default function Portfolio() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Portfolio</h2>
      <p className="text-gray-600">
        This is where you'll be able to track your personal stock portfolio. 
        Features coming soon:
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
        <li>Add and remove stocks from your portfolio</li>
        <li>View real-time performance of your holdings</li>
        <li>Get AI-powered insights on your portfolio composition</li>
        <li>Set up alerts for significant price movements</li>
      </ul>
    </div>
  );
}