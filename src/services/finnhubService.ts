import axios from 'axios';

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface StockData {
  symbol: string;
  currentPrice: number | null;
  allTimeHigh: number | null;
  percentFromHigh: number | null;
}

export interface InsiderSentiment {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

export async function getStockData(symbol: string): Promise<StockData> {
  try {
    const [quoteResponse, financialsResponse] = await Promise.all([
      axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: { symbol, token: FINNHUB_API_KEY }
      }),
      axios.get(`${FINNHUB_BASE_URL}/stock/metric`, {
        params: { symbol, metric: 'all', token: FINNHUB_API_KEY }
      })
    ]);

    const currentPrice = quoteResponse.data.c;
    const allTimeHigh = financialsResponse.data.metric['52WeekHigh'];
    const percentFromHigh = allTimeHigh ? ((currentPrice - allTimeHigh) / allTimeHigh) * 100 : null;

    return {
      symbol,
      currentPrice,
      allTimeHigh,
      percentFromHigh
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return {
      symbol,
      currentPrice: null,
      allTimeHigh: null,
      percentFromHigh: null
    };
  }
}

export async function getInsiderSentiment(symbol: string): Promise<InsiderSentiment | null> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 3); // Get data for the last 3 months

    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/insider-sentiment`, {
      params: {
        symbol,
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        token: FINNHUB_API_KEY
      }
    });

    const sentiments = response.data.data;
    
    if (sentiments && sentiments.length > 0) {
      // Sort sentiments by year and month, descending
      sentiments.sort((a: InsiderSentiment, b: InsiderSentiment) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      
      // Return the most recent sentiment
      return sentiments[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching insider sentiment for ${symbol}:`, error);
    return null;
  }
}

export async function getStockQuote(symbol: string): Promise<number | null> {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: { symbol, token: FINNHUB_API_KEY }
    });
    return response.data.c || null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}