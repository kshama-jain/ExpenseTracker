"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, FileText, Brain, CheckCircle } from "lucide-react"

interface ReceiptScannerProps {
  onAddExpense: (expense: {
    amount: number
    description: string
    category: string
    date: string
  }) => void
}

interface ScannedData {
  merchant: string
  amount: number
  date: string
  items: string[]
  suggestedCategory: string
  confidence: number
}

export function ReceiptScanner({ onAddExpense }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Mock receipt scanning
  const mockScanReceipt = async (): Promise<ScannedData> => {
    // Simulate different types of receipts
    const mockReceipts = [
      {
        merchant: "Whole Foods Market",
        amount: 67.43,
        date: new Date().toISOString().split("T")[0],
        items: ["Organic Bananas", "Greek Yogurt", "Chicken Breast", "Spinach"],
        suggestedCategory: "Food & Dining",
        confidence: 94,
      },
      {
        merchant: "Shell Gas Station",
        amount: 45.2,
        date: new Date().toISOString().split("T")[0],
        items: ["Regular Gasoline"],
        suggestedCategory: "Transportation",
        confidence: 98,
      },
      {
        merchant: "Amazon.com",
        amount: 29.99,
        date: new Date().toISOString().split("T")[0],
        items: ["Wireless Mouse", "USB Cable"],
        suggestedCategory: "Shopping",
        confidence: 87,
      },
      {
        merchant: "Starbucks Coffee",
        amount: 12.45,
        date: new Date().toISOString().split("T")[0],
        items: ["Grande Latte", "Blueberry Muffin"],
        suggestedCategory: "Food & Dining",
        confidence: 96,
      },
    ]

    return mockReceipts[Math.floor(Math.random() * mockReceipts.length)]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsScanning(true)
    setScannedData(null)

    try {
      // Simulate OCR processing time
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const data = await mockScanReceipt()
      setScannedData(data)
    } catch (error) {
      console.error("Error scanning receipt:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleAddExpense = () => {
    if (!scannedData) return

    onAddExpense({
      amount: scannedData.amount,
      description: `${scannedData.merchant} - ${scannedData.items.join(", ")}`,
      category: scannedData.suggestedCategory,
      date: scannedData.date,
    })

    // Reset
    setScannedData(null)
    setSelectedFile(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
          <CardDescription>Upload a receipt image and let AI extract the expense details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <span className="text-lg font-medium">Upload Receipt</span>
                    <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to select an image</p>
                  </Label>
                  <Input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {selectedFile && <div className="text-sm text-muted-foreground">Selected: {selectedFile.name}</div>}
              </div>
            </div>

            {isScanning && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <Brain className="h-5 w-5 animate-pulse" />
                  <span>AI is analyzing your receipt...</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-muted-foreground">🔍 Detecting text...</div>
                  <div className="text-sm text-muted-foreground">🏪 Identifying merchant...</div>
                  <div className="text-sm text-muted-foreground">💰 Extracting amounts...</div>
                  <div className="text-sm text-muted-foreground">🏷️ Categorizing expense...</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scanned Results */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Scanned Receipt Data
            </CardTitle>
            <CardDescription>Review the extracted information before adding to expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Merchant</Label>
                  <div className="text-lg font-semibold">{scannedData.merchant}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <div className="text-lg font-semibold">${scannedData.amount.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <div className="text-lg">{new Date(scannedData.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">AI Confidence</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Brain className="h-3 w-3 mr-1" />
                      {scannedData.confidence}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Items Detected</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {scannedData.items.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Suggested Category</Label>
                <div className="mt-2">
                  <Badge variant="default">{scannedData.suggestedCategory}</Badge>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleAddExpense} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Add to Expenses
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScannedData(null)
                    setSelectedFile(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Scanning</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure the receipt is well-lit and clearly visible</li>
            <li>• Avoid shadows and glare on the receipt</li>
            <li>• Make sure all text is readable in the image</li>
            <li>• Supported formats: JPG, PNG, HEIC</li>
            <li>• AI works best with standard retail receipts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
