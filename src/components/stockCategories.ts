export interface CategoryData {
  [key: string]: string[];
}

export const STOCK_CATEGORIES: CategoryData = {
  'Chips': ['NVDA', 'AMD', 'INTC', 'TSM', 'QCOM'],
  'Cloud': ['GOOGL', 'MSFT', 'AMZN', 'CRM', 'NOW'],
  'Energy': ['TSLA', 'ENPH', 'SMCI', 'AAPL', 'ASML'],
  'Infrastructure': ['IBM', 'ORCL', 'CSCO', 'ADSK'],  // VMW removed from this category
};

export const ALL_STOCKS = Object.values(STOCK_CATEGORIES).flat();