import { NextResponse } from 'next/server'
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
    console.log(`Fetching data for symbol: ${symbol}, period: ${period}`)

    const queryOptions: any = {
      period2: new Date(),
      interval: '1d'
    }

    // Adjust query options based on the selected period
    switch (period) {
      case '5m':
      case '15m':
      case '30m':
      case '1h':
        queryOptions.period1 = '1d'
        queryOptions.interval = period
        break
      case '1d':
      case '5d':
        queryOptions.period1 = period
        queryOptions.interval = '1h'
        break
      case '1mo':
        queryOptions.period1 = '1mo'
        queryOptions.interval = '1d'
        break
      case 'custom':
        if (from && to) {
          queryOptions.period1 = new Date(from)
          queryOptions.period2 = new Date(to)
          queryOptions.interval = '1h'
        } else {
          return NextResponse.json({ error: 'Missing date range for custom period' }, { status: 400 })
        }
        break
      default:
        queryOptions.period1 = '1mo'
        queryOptions.interval = '1d'
    }

    console.log('Query options:', queryOptions)

    const result = await yahooFinance.historical(symbol, queryOptions)
    
    console.log(`Received ${result.length} data points`)

    if (result.length === 0) {
      return NextResponse.json({ error: 'No data available for the specified period' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error.message }, { status: 500 })
  }
}