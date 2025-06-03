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

    const [rows] = await db.execute("SELECT month, budget_amount FROM monthly_budgets WHERE user_id = ?", [user.userId])

    const budgets = (rows as any[]).reduce((acc, row) => {
      acc[row.month] = row.budget_amount
      return acc
    }, {})

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Get monthly budgets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { month, budgetAmount } = await request.json()

    await db.execute(
      "INSERT INTO monthly_budgets (user_id, month, budget_amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE budget_amount = ?",
      [user.userId, month, budgetAmount, budgetAmount],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Set monthly budget error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
