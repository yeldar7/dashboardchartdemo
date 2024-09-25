import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface YahooFinanceQuote {
  date: string;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  adjclose: number;
}

interface YahooFinanceResult {
  meta: {
    currency: string;
    symbol: string;
    exchangeName: string;
    instrumentType: string;
    firstTradeDate: string;
    regularMarketTime: string;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    chartPreviousClose: number;
    priceHint: number;
    currentTradingPeriod: {
      pre: { timezone: string; start: string; end: string; gmtoffset: number };
      regular: { timezone: string; start: string; end: string; gmtoffset: number };
      post: { timezone: string; start: string; end: string; gmtoffset: number };
    };
    dataGranularity: string;
    range: string;
    validRanges: string[];
  };
  quotes: YahooFinanceQuote[];
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol');
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (!symbol || !from || !to) {
            console.error('Missing required parameters');
            return NextResponse.json({ error: 'Symbol, from, and to dates are required' }, { status: 400 });
        }

        const queryOptions: any = {
            period1: new Date(from),
            period2: new Date(to),
            interval: '1d',
        };

        console.log(`Fetching data for ${symbol} with options`, queryOptions);

        const result = await yahooFinance.chart(symbol, queryOptions) as unknown as YahooFinanceResult;

        console.log('Yahoo Finance API response:', JSON.stringify(result, null, 2));

        if (!result || !result.quotes || result.quotes.length === 0) {
            return NextResponse.json({ error: 'No stock data available' }, { status: 404 });
        }

        // Map the extracted data into the format your frontend expects
        const stockData = result.quotes.map((quote) => ({
            date: quote.date,
            open: quote.open,
            close: quote.close,
            low: quote.low,
            high: quote.high,
        }));

        console.log('Processed stock data:', JSON.stringify(stockData, null, 2));

        return NextResponse.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data from Yahoo Finance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stock data' },
            { status: 500 }
        );
    }
}