import type { NextApiRequest, NextApiResponse } from 'next'
import faunadb from 'faunadb'

const q = faunadb.query
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY || '' })

interface HistoricalDataPoint {
  date: string;
  value: number;
}

interface FaunaQueryResult {
  data: {
    data: HistoricalDataPoint;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const result = await client.query<FaunaQueryResult>(
      q.Map(
        q.Paginate(q.Match(q.Index('all_historical_data')), { size: 30 }),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    )
    
    if (Array.isArray(result.data)) {
      const data = result.data
        .map(item => item.data)
        .filter((item): item is HistoricalDataPoint => 
          typeof item.date === 'string' && typeof item.value === 'number'
        )
      res.status(200).json(data)
    } else {
      throw new Error('Unexpected result structure from FaunaDB')
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to retrieve data' })
  }
}