"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
}

interface Budget {
  category: string
  limit: number
  spent: number
}

interface ExpenseAnalyticsProps {
  expenses: Expense[]
  budgets: Budget[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function ExpenseAnalytics({ expenses, budgets }: ExpenseAnalyticsProps) {
  // Category breakdown
  const categoryData = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryChartData = Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount,
    percentage: ((amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1),
  }))

  // Monthly trend (mock data for demo)
  const monthlyData = [
    { month: "Oct", amount: 1200 },
    { month: "Nov", amount: 1450 },
    { month: "Dec", amount: 1680 },
    { month: "Jan", amount: expenses.reduce((sum, e) => sum + e.amount, 0) },
  ]

  // Budget analysis
  const budgetAnalysis = budgets.map((budget) => ({
    ...budget,
    percentage: (budget.spent / budget.limit) * 100,
    remaining: budget.limit - budget.spent,
    status: budget.spent > budget.limit ? "over" : budget.spent > budget.limit * 0.8 ? "warning" : "good",
  }))

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(categoryData).length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalExpenses / expenses.length).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average amount</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Your expense distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
          <CardDescription>How you're tracking against your budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetAnalysis.map((budget) => (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{budget.category}</span>
                    <Badge
                      variant={
                        budget.status === "over" ? "destructive" : budget.status === "warning" ? "default" : "secondary"
                      }
                    >
                      {budget.status === "over"
                        ? "Over Budget"
                        : budget.status === "warning"
                          ? "Near Limit"
                          : "On Track"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {budget.remaining >= 0
                        ? `$${budget.remaining.toFixed(2)} remaining`
                        : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.status === "over"
                        ? "bg-red-500"
                        : budget.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
