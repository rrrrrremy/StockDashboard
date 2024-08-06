import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route hit:', req.method, req.url);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { stockData } = req.body;
  console.log('Received stock data:', JSON.stringify(stockData, null, 2));

  if (!stockData) {
    return res.status(400).json({ message: 'Stock data is required' });
  }

  console.log('Checking ANTHROPIC_API_KEY...');
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    console.log('Available environment variables:', Object.keys(process.env));
    return res.status(500).json({ 
      message: 'Server configuration error',
      details: 'ANTHROPIC_API_KEY is not set. Available env vars: ' + Object.keys(process.env).join(', ')
    });
  }
  console.log('ANTHROPIC_API_KEY is set');

  try {
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const prompt = `Analyze the following stock data and provide a concise summary of this investment opportunity:
    Symbol: ${stockData.symbol}
    Current Price: $${stockData.currentPrice}
    52-Week High: $${stockData.allTimeHigh}
    Percent from High: ${stockData.percentFromHigh}%
    Insider Sentiment: ${stockData.insiderSentiment ? stockData.insiderSentiment.mspr : 'N/A'}
    Latest News: ${stockData.news ? stockData.news.title : 'No recent news'}

    Please provide a brief analysis of this stock's potential as an investment opportunity, considering its current price relative to its 52-week high, insider sentiment, and any relevant news. Limit your response to 3-4 sentences.`;

    console.log('Sending request to Claude API with prompt:', prompt);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 150,
      temperature: 0,
      system: "You are a financial analyst providing brief stock analyses.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    console.log('Received response from Claude API:', JSON.stringify(response, null, 2));
    const analysis = response.content[0].text;
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ 
      message: 'Error generating analysis', 
      error: error.message,
      details: error.response ? error.response.data : 'No additional details available'
    });
  }
}