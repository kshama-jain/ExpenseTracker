"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PiggyBank, AlertTriangle, CheckCircle, Plus } from "lucide-react"
import { getAuthHeaders } from "@/lib/auth"

interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
}

interface BudgetManagementProps {
  monthlyBudgets: Record<string, number>
  setMonthlyBudgets: (budgets: Record<string, number>) => void
  expenses: Expense[]
}

export function BudgetManagement({ monthlyBudgets, setMonthlyBudgets, expenses }: BudgetManagementProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [budgetAmount, setBudgetAmount] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Generate last 12 months for selection
  const generateMonths = () => {
    const months = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      months.push(date.toISOString().slice(0, 7))
    }
    return months
  }

  const months = generateMonths()

  // Calculate monthly expenses
  const getMonthlyExpenses = (month: string) => {
    return expenses
      .filter((expense) => expense.date.startsWith(month))
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Get category breakdown for a month
  const getMonthlyCategories = (month: string) => {
    const monthExpenses = expenses.filter((expense) => expense.date.startsWith(month))
    const categories: Record<string, number> = {}

    monthExpenses.forEach((expense) => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount
    })

    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const handleSetBudget = async () => {
    if (budgetAmount && selectedMonth) {
      try {
        const response = await fetch("/api/budgets/monthly", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            month: selectedMonth,
            budgetAmount: Number.parseFloat(budgetAmount),
          }),
        })

        if (response.ok) {
          setMonthlyBudgets({
            ...monthlyBudgets,
            [selectedMonth]: Number.parseFloat(budgetAmount),
          })
          setBudgetAmount("")
          setIsEditing(false)
        }
      } catch (error) {
        console.error("Error setting budget:", error)
      }
    }
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const currentMonthExpenses = getMonthlyExpenses(selectedMonth)
  const currentMonthBudget = monthlyBudgets[selectedMonth] || 0
  const budgetUsedPercentage = currentMonthBudget > 0 ? (currentMonthExpenses / currentMonthBudget) * 100 : 0
  const remainingBudget = currentMonthBudget - currentMonthExpenses

  const getBudgetStatus = () => {
    if (budgetUsedPercentage >= 100) return "exceeded"
    if (budgetUsedPercentage >= 80) return "warning"
    return "good"
  }

  const budgetStatus = getBudgetStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Monthly Budget Management
          </CardTitle>
          <CardDescription>Set and track your monthly spending limits to stay on top of your finances</CardDescription>
        </CardHeader>
      </Card>

      {/* Budget Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Set Monthly Budget</CardTitle>
          <CardDescription>Choose a month and set your spending limit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget Amount ($)</Label>
              <Input
                type="number"
                placeholder="Enter budget amount"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSetBudget} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </div>
          </div>

          {monthlyBudgets[selectedMonth] && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Current budget for {formatMonth(selectedMonth)}:{" "}
                <strong>${monthlyBudgets[selectedMonth].toFixed(2)}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Month Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget Overview - {formatMonth(selectedMonth)}</span>
            <Badge
              variant={
                budgetStatus === "exceeded" ? "destructive" : budgetStatus === "warning" ? "default" : "secondary"
              }
            >
              {budgetStatus === "exceeded" ? "Over Budget" : budgetStatus === "warning" ? "Near Limit" : "On Track"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthBudget > 0 ? (
            <div className="space-y-6">
              {/* Budget Status Alert */}
              {budgetStatus === "exceeded" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You've exceeded your monthly budget by ${Math.abs(remainingBudget).toFixed(2)}. Consider reviewing
                    your expenses.
                  </AlertDescription>
                </Alert>
              )}

              {budgetStatus === "warning" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You've used {budgetUsedPercentage.toFixed(1)}% of your monthly budget. Only $
                    {remainingBudget.toFixed(2)} remaining.
                  </AlertDescription>
                </Alert>
              )}

              {budgetStatus === "good" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Great job! You're staying within your budget. ${remainingBudget.toFixed(2)} remaining.
                  </AlertDescription>
                </Alert>
              )}

              {/* Budget Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Budget Progress</span>
                  <span className="text-sm text-muted-foreground">
                    ${currentMonthExpenses.toFixed(2)} / ${currentMonthBudget.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={Math.min(budgetUsedPercentage, 100)}
                  className={`h-3 ${budgetStatus === "exceeded" ? "bg-red-100" : ""}`}
                />
                <div className="text-center text-sm text-muted-foreground">
                  {budgetUsedPercentage.toFixed(1)}% of budget used
                </div>
              </div>

              {/* Spending Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium">Spending by Category</h4>
                <div className="space-y-3">
                  {getMonthlyCategories(selectedMonth).map(({ category, amount }) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                        <Badge variant="outline" className="text-xs">
                          {((amount / currentMonthExpenses) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budget set for {formatMonth(selectedMonth)}</p>
              <p className="text-sm">Set a budget above to start tracking your expenses</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Months Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Months Overview</CardTitle>
          <CardDescription>Your budget performance across all months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {months.map((month) => {
              const monthExpenses = getMonthlyExpenses(month)
              const monthBudget = monthlyBudgets[month]
              const percentage = monthBudget ? (monthExpenses / monthBudget) * 100 : 0

              return (
                <div key={month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMonth(month)}</span>
                      {!monthBudget && <Badge variant="outline">No Budget Set</Badge>}
                      {monthBudget && percentage >= 100 && <Badge variant="destructive">Over Budget</Badge>}
                      {monthBudget && percentage >= 80 && percentage < 100 && (
                        <Badge variant="default">Near Limit</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${monthExpenses.toFixed(2)}
                        {monthBudget && ` / $${monthBudget.toFixed(2)}`}
                      </div>
                      {monthBudget && (
                        <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}% used</div>
                      )}
                    </div>
                  </div>
                  {monthBudget && (
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={`h-2 ${percentage >= 100 ? "bg-red-100" : ""}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
