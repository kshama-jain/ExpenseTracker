import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import db from "@/lib/db"

function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get category budgets
    const [budgetRows] = await db.execute("SELECT category, budget_limit FROM category_budgets WHERE user_id = ?", [
      user.userId,
    ])

    // Get spent amounts by category
    const [spentRows] = await db.execute(
      `SELECT category, SUM(amount) as spent 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY category`,
      [user.userId],
    )

    const spentByCategory = (spentRows as any[]).reduce((acc, row) => {
      acc[row.category] = Number.parseFloat(row.spent)
      return acc
    }, {})

    const budgets = (budgetRows as any[]).map((row) => ({
      category: row.category,
      limit: Number.parseFloat(row.budget_limit),
      spent: spentByCategory[row.category] || 0,
    }))

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Get category budgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
