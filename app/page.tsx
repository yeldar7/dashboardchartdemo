'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays, subMonths, subYears } from "date-fns"
import { Moon, Sun } from "lucide-react"
import ReactECharts from 'echarts-for-react'
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

interface StockData {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
}

export default function Page() {
  const [darkMode, setDarkMode] = useState(false)
  const currentDate = new Date()
  const [stockData, setStockData] = useState<StockData[]>([])
  const [stockTicker, setStockTicker] = useState('')
  const [timeRange, setTimeRange] = useState('1d')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 1),
    to: new Date(),
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    console.log('Stock data updated:', stockData)
  }, [stockData])

  const handleStockSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stockTicker) {
      await fetchStockData()
    }
  }

  const handleTimeRangeSelect = (value: string) => {
    setTimeRange(value)
    const to = new Date()
    let from: Date

    switch (value) {
      case '1d':
        from = subDays(to, 1)
        break
      case '1w':
        from = subDays(to, 7)
        break
      case '1m':
        from = subMonths(to, 1)
        break
      case '3m':
        from = subMonths(to, 3)
        break
      case '6m':
        from = subMonths(to, 6)
        break
      case '1y':
        from = subYears(to, 1)
        break
      case '5y':
        from = subYears(to, 5)
        break
      default:
        from = subDays(to, 1)
    }

    setDateRange({ from, to })
  }

  const fetchStockData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `/api/stock?symbol=${stockTicker}&from=${dateRange?.from?.toISOString()}&to=${dateRange?.to?.toISOString()}`
      console.log('Fetching data from:', url)
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch stock data')
      }
      const data: StockData[] = await response.json()
      console.log('Received data:', data)
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data received from the server')
      }
      setStockData(data)
      console.log('Stock data set:', data)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getChartOptions = () => {
    console.log('Generating chart options with data:', stockData)
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        data: stockData.map(item => format(new Date(item.date), 'yyyy-MM-dd HH:mm')),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'Stock Price',
          type: 'candlestick',
          data: stockData.map(item => [item.open, item.close, item.low, item.high]),
          itemStyle: {
            color: 'hsl(var(--success))',
            color0: 'hsl(var(--destructive))',
            borderColor: 'hsl(var(--success))',
            borderColor0: 'hsl(var(--destructive))'
          }
        }
      ]
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="text-center flex-grow">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Stock Chart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Today is {format(currentDate, "EEEE, do MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            aria-label="Toggle dark mode"
          />
          <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row items-start justify-center p-4 gap-4">
        <Card className="w-full md:w-96 bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-3">
            <form onSubmit={handleStockSearch} className="space-y-4">
              <Input
                type="text"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                placeholder="Enter stock ticker"
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
            </form>
            <div className="mt-4">
              <Select onValueChange={handleTimeRangeSelect} defaultValue={timeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="5y">5 Years</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {timeRange === 'custom' && (
              <div className="mt-4">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:flex-grow bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100">
              {stockTicker ? `${stockTicker.toUpperCase()} Stock Data` : 'Stock Data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {isLoading ? (
              <p>Loading...</p>
            ) : stockData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ReactECharts
                  option={getChartOptions()}
                  style={{ height: '100%', width: '100%' }}
                  theme={darkMode ? 'dark' : undefined}
                  notMerge={true}
                  lazyUpdate={false}
                />
              </div>
            ) : (
              <p>No data available. Please search for a stock ticker.</p>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white dark:bg-gray-800 p-4 text-center text-gray-600 dark:text-gray-400 shadow-md">
        <p>&copy; 2024 Stock Chart Demo. All rights reserved.</p>
      </footer>
    </div>
  )
}