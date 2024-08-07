import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { getAIStocksData } from '../../services/stockService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const stocksData = await getAIStocksData()
    const totalValue = stocksData.reduce((sum, stock) => sum + (stock.currentPrice || 0), 0)
    
    const currentDate = new Date().toISOString().split('T')[0]
    
    const filePath = path.join(process.cwd(), 'public', 'historical_data.json')
    let historicalData = { data: [] }

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      historicalData = JSON.parse(fileContent)
    }
    
    historicalData.data.push({
      date: currentDate,
      value: totalValue
    })
    
    // Keep only the last 30 days of data
    if (historicalData.data.length > 30) {
      historicalData.data = historicalData.data.slice(-30)
    }
    
    fs.writeFileSync(filePath, JSON.stringify(historicalData, null, 2))
    
    res.status(200).json({ message: "Historical data updated successfully" })
  } catch (error) {
    console.error('Error updating historical data:', error)
    res.status(500).json({ message: "Failed to update historical data" })
  }
}