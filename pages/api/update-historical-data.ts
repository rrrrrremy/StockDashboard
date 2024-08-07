import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { data } = req.body

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Invalid data format' })
    }

    const filePath = path.join(process.cwd(), 'public', 'historical_data.json')
    
    fs.writeFileSync(filePath, JSON.stringify({ data }, null, 2))
    
    res.status(200).json({ message: "Historical data updated successfully" })
  } catch (error) {
    console.error('Error updating historical data:', error)
    res.status(500).json({ message: "Failed to update historical data" })
  }
}