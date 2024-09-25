import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const period = searchParams.get('period')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!symbol || !period) {
    return NextResponse.json({ error: 'Missing symbol or period' }, { status: 400 })
  }

  try {
    let interval = '1d'
    let range = '1mo'

    switch (period) {
      case '5m':
      case '15m':
      case '30m':
        interval = period
        range = '1d'
        break
      case '1h':
        interval = '60m'
        range = '1d'
        break
      case '1d':
        interval = '1d'
        range = '5d'
        break
      case '5d':
        interval = '1d'
        range = '1mo'
        break
      case '1mo':
        interval = '1d'
        range = '1mo'
        break
      case 'custom':
        if (from && to) {
          interval = '1d'
          range = 'custom'
        } else {
          return NextResponse.json({ error: 'Missing date range for custom period' }, { status: 400 })
        }
        break
    }

    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    
    if (range === 'custom') {
      url += `&period1=${Math.floor(new Date(from).getTime() / 1000)}&period2=${Math.floor(new Date(to).getTime() / 1000)}`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (data.chart.error) {
      throw new Error(data.chart.error.description)
    }

    const stockData = data.chart.result[0]
    const timestamps = stockData.timestamp
    const quotes = stockData.indicators.quote[0]

    const formattedData = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error.message }, { status: 500 })
  }
}