import axios from 'axios';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  relevanceScore: number;
}

export async function getStockNews(symbol: string): Promise<NewsItem | null> {
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: `${symbol} AND (earnings OR revenue OR growth OR "stock price" OR investor OR market)`,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      }
    });

    const articles = response.data.articles;

    if (articles.length === 0) {
      return null;
    }

    const scoredArticles = articles.map((article: NewsItem) => ({
      ...article,
      relevanceScore: calculateRelevanceScore(article, symbol)
    }));

    return scoredArticles.sort((a: NewsItem, b: NewsItem) => b.relevanceScore - a.relevanceScore)[0];
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return null;
  }
}

export async function getAINews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: 'artificial intelligence AND (technology OR innovation OR "machine learning" OR "deep learning" OR robotics)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: NEWS_API_KEY
      }
    });

    const articles = response.data.articles;

    if (articles.length === 0) {
      return [];
    }

    return articles.map((article: NewsItem) => ({
      ...article,
      relevanceScore: calculateRelevanceScore(article, 'AI')
    }));
  } catch (error) {
    console.error('Error fetching AI news:', error);
    return [];
  }
}

function calculateRelevanceScore(article: NewsItem, keyword: string): number {
  let score = 0;
  const lowercaseTitle = article.title.toLowerCase();
  const lowercaseDescription = article.description.toLowerCase();

  if (lowercaseTitle.includes(keyword.toLowerCase()) || lowercaseDescription.includes(keyword.toLowerCase())) {
    score += 5;
  }

  const keywords = ['artificial intelligence', 'AI', 'machine learning', 'deep learning', 'neural networks', 'robotics', 'innovation', 'technology'];
  keywords.forEach(keyword => {
    if (lowercaseTitle.includes(keyword)) score += 2;
    if (lowercaseDescription.includes(keyword)) score += 1;
  });

  const daysSincePublished = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 3600 * 24);
  score += Math.max(0, 5 - daysSincePublished);

  return score;
}