"use client"

import React, { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parse, setHours, setMinutes } from "date-fns"
import { Moon, Sun } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ReactECharts from 'echarts-for-react'

export function PageComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [darkMode, setDarkMode] = useState(false)
  const currentDate = new Date()
  const [stockData, setStockData] = useState([])
  const [stockTicker, setStockTicker] = useState('')
  const [timeFrame, setTimeFrame] = useState('1d')
  const [showCalendar, setShowCalendar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("16:00")

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleStockSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stockTicker) {
      await fetchStockData(stockTicker, timeFrame)
    }
  }

  const handleTimeFrameSelect = async (value: string) => {
    setTimeFrame(value)
    if (value === 'custom') {
      setShowCalendar(true)
    } else {
      setShowCalendar(false)
      if (stockTicker) {
        await fetchStockData(stockTicker, value)
      }
    }
  }

  const fetchStockData = async (ticker: string, period: string) => {
    setIsLoading(true)
    setError(null)
    try {
      let url = `/api/stock?symbol=${ticker}&period=${period}`
      if (period === 'custom' && dateRange.from && dateRange.to) {
        const fromDate = setMinutes(setHours(dateRange.from, parseInt(startTime.split(':')[0])), parseInt(startTime.split(':')[1]))
        const toDate = setMinutes(setHours(dateRange.to, parseInt(endTime.split(':')[0])), parseInt(endTime.split(':')[1]))
        url += `&from=${fromDate.toISOString()}&to=${toDate.toISOString()}`
      }
      console.log('Fetching data from:', url)
      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch stock data')
      }
      const data = await response.json()
      console.log('Received data:', data)
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data received from the server')
      }
      setStockData(data.map((item: any) => [
        format(new Date(item.date), 'yyyy-MM-dd HH:mm'),
        item.open,
        item.close,
        item.low,
        item.high
      ]))
    } catch (error) {
      console.error('Error fetching stock data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(<SelectItem key={time} value={time}>{time}</SelectItem>)
      }
    }
    return options
  }

  const getChartOptions = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'category',
      data: stockData.map(item => item[0]),
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
        name: 'Candlestick',
        type: 'candlestick',
        data: stockData,
        itemStyle: {
          color: 'hsl(var(--success))',
          color0: 'hsl(var(--destructive))',
          borderColor: 'hsl(var(--success))',
          borderColor0: 'hsl(var(--destructive))'
        }
      }
    ]
  })

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
              <Select onValueChange={handleTimeFrameSelect} defaultValue={timeFrame}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="5d">5 days</SelectItem>
                  <SelectItem value="1mo">1 month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCalendar && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-4">
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex justify-between mt-4">
                  <Select onValueChange={setStartTime} defaultValue={startTime}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Start Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions()}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={setEndTime} defaultValue={endTime}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="End Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions()}
                    </SelectContent>
                  </Select>
                </div>
              </>
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