import { getStockData, getInsiderSentiment, StockData, InsiderSentiment } from './finnhubService';
import { getStockNews, NewsItem } from './newsApiService';
import { ALL_STOCKS } from '../components/stockCategories';

export interface StockOpportunity extends StockData {
  news: NewsItem | null;
  insiderSentiment: InsiderSentiment | null;
}

interface CachedNews {
  [symbol: string]: {
    news: NewsItem | null;
    timestamp: number;
  };
}

const NEWS_CACHE_KEY = 'aiStockNewsCache';
const NEWS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCachedNews(): CachedNews {
  const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
  return cachedData ? JSON.parse(cachedData) : {};
}

function setCachedNews(symbol: string, news: NewsItem | null) {
  const cachedNews = getCachedNews();
  cachedNews[symbol] = {
    news,
    timestamp: Date.now()
  };
  localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cachedNews));
}

async function getNewsWithCaching(symbol: string): Promise<NewsItem | null> {
  const cachedNews = getCachedNews();
  const cachedItem = cachedNews[symbol];

  if (cachedItem && Date.now() - cachedItem.timestamp < NEWS_CACHE_DURATION) {
    return cachedItem.news;
  }

  const news = await getStockNews(symbol);
  setCachedNews(symbol, news);
  return news;
}

export async function getAIStocksData(): Promise<StockOpportunity[]> {
  try {
    const stockDataPromises = ALL_STOCKS.map(async (symbol) => {
      const [stockData, newsData, insiderSentiment] = await Promise.all([
        getStockData(symbol),
        getNewsWithCaching(symbol),
        getInsiderSentiment(symbol)
      ]);
      return { ...stockData, news: newsData, insiderSentiment };
    });

    const results = await Promise.all(stockDataPromises);
    
    if (results.length === 0) {
      throw new Error('No stock data was successfully retrieved');
    }

    return results;
  } catch (error) {
    console.error('Error fetching AI stocks data:', error);
    throw error;
  }
}