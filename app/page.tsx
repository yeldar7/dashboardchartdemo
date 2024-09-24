"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Moon, Sun } from "lucide-react"

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
]

export default function Page() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [darkMode, setDarkMode] = React.useState(false)
  const currentDate = new Date()

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="text-center flex-grow">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {format(currentDate, "MMMM yyyy")}
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
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-gray-200 dark:border-gray-700"
            />
          </CardContent>
        </Card>

        <Card className="w-full md:w-96 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100">Monthly Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white dark:bg-gray-800 p-4 text-center text-gray-600 dark:text-gray-400 shadow-md">
        <p>&copy; 2024 Calendar Demo. All rights reserved.</p>
      </footer>
    </div>
  )
}