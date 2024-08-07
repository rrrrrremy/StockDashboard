import type { NextApiRequest, NextApiResponse } from 'next'
import faunadb from 'faunadb'

const q = faunadb.query
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY || '' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { date, value } = req.body
    const result = await client.query(
      q.Let(
        {
          match: q.Match(q.Index('historical_data_by_date'), date)
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: { date, value } }),
          q.Create(q.Collection('historical_data'), { data: { date, value } })
        )
      )
    )
    res.status(200).json({ message: 'Data updated successfully' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to update data' })
  }
}