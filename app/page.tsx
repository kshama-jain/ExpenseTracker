"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Calendar, PiggyBank } from "lucide-react"
import { AddExpenseForm } from "./components/add-expense-form"
import { ExpenseList } from "./components/expense-list"
import { ExpenseAnalytics } from "./components/expense-analytics"
import { ReceiptScanner } from "./components/receipt-scanner"
import { AuthPages } from "./components/auth-pages"
import { Button } from "@/components/ui/button"
import { BudgetManagement } from "./components/budget-management"
import { getAuthToken, removeAuthToken, getAuthHeaders } from "@/lib/auth"

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

export default function ExpenseManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      // Decode token to get user info (in production, validate with server)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setCurrentUser({ name: payload.name || "User", email: payload.email })
        setIsAuthenticated(true)
        loadUserData()
      } catch {
        removeAuthToken()
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const loadUserData = async () => {
    try {
      // Load expenses
      const expensesRes = await fetch("/api/expenses", {
        headers: getAuthHeaders(),
      })
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }

      // Load monthly budgets
      const monthlyRes = await fetch("/api/budgets/monthly", {
        headers: getAuthHeaders(),
      })
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json()
        setMonthlyBudgets(monthlyData)
      }

      // Load category budgets
      const categoryRes = await fetch("/api/budgets/category", {
        headers: getAuthHeaders(),
      })
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json()
        setBudgets(categoryData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: { name: string; email: string }) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
    loadUserData()
  }

  const handleLogout = () => {
    removeAuthToken()
    setCurrentUser(null)
    setIsAuthenticated(false)
    setExpenses([])
    setBudgets([])
    setMonthlyBudgets({})
  }

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(expense),
      })

      if (response.ok) {
        const newExpense = await response.json()
        setExpenses((prev) => [newExpense, ...prev])
        // Reload budgets to update spent amounts
        loadUserData()
      }
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
        // Reload budgets to update spent amounts
        loadUserData()
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const updateMonthlyBudgets = async (newBudgets: Record<string, number>) => {
    setMonthlyBudgets(newBudgets)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPages onLogin={handleLogin} />
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const thisMonthExpenses = expenses
    .filter((expense) => new Date(expense.date).getMonth() === new Date().getMonth())
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Management System</h1>
            <p className="text-gray-600">Track your expenses and manage your budgets</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-expense">Add Expense</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budget-management">Budget Limits</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="receipt-scanner">Receipt Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${thisMonthExpenses.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">January 2024</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${monthlyBudgets[new Date().toISOString().slice(0, 7)] || 0}</div>
                  <p className="text-xs text-muted-foreground">Current month limit</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{budgets.length}</div>
                  <p className="text-xs text-muted-foreground">Active budgets</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Track your spending against budgets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = (budget.spent / budget.limit) * 100
                  const isOverBudget = percentage > 100

                  return (
                    <div key={budget.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                          </span>
                          {isOverBudget && <Badge variant="destructive">Over Budget</Badge>}
                        </div>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{expense.description}</span>
                          <Badge variant="outline">{expense.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{expense.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${expense.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-expense">
            <AddExpenseForm onAddExpense={addExpense} />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
          </TabsContent>

          <TabsContent value="budget-management">
            <BudgetManagement
              monthlyBudgets={monthlyBudgets}
              setMonthlyBudgets={updateMonthlyBudgets}
              expenses={expenses}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <ExpenseAnalytics expenses={expenses} budgets={budgets} />
          </TabsContent>

          <TabsContent value="receipt-scanner">
            <ReceiptScanner onAddExpense={addExpense} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
