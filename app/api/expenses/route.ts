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

    const [rows] = await db.execute(
      "SELECT id, amount, description, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC",
      [user.userId],
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, category, date } = await request.json()

    const [result] = (await db.execute(
      "INSERT INTO expenses (user_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?)",
      [user.userId, amount, description, category, date],
    )) as any

    const [newExpense] = await db.execute("SELECT id, amount, description, category, date FROM expenses WHERE id = ?", [
      result.insertId,
    ])

    return NextResponse.json((newExpense as any[])[0])
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
