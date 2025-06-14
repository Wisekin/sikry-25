"use client"

import { useEffect, useRef } from "react"
import { Text } from "@/src/components/core/typography/Text"

export function CollectionTrends() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // This is a placeholder for chart rendering
    // In a real implementation, you would use a charting library like Chart.js or D3.js
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set dimensions
        const width = canvas.width
        const height = canvas.height
        const padding = 40

        // Draw axes
        ctx.beginPath()
        ctx.moveTo(padding, padding)
        ctx.lineTo(padding, height - padding)
        ctx.lineTo(width - padding, height - padding)
        ctx.strokeStyle = "#5A697B"
        ctx.stroke()

        // Draw line chart (sample data)
        const data = [25, 40, 30, 50, 60, 70, 65, 75, 85, 90, 100]
        const dataPoints = data.length
        const xStep = (width - padding * 2) / (dataPoints - 1)
        const yScale = (height - padding * 2) / 100

        // Draw line
        ctx.beginPath()
        ctx.moveTo(padding, height - padding - data[0] * yScale)
        for (let i = 1; i < dataPoints; i++) {
          ctx.lineTo(padding + i * xStep, height - padding - data[i] * yScale)
        }
        ctx.strokeStyle = "#6E3AFF"
        ctx.lineWidth = 2
        ctx.stroke()

        // Fill area under the line
        ctx.lineTo(padding + (dataPoints - 1) * xStep, height - padding)
        ctx.lineTo(padding, height - padding)
        ctx.fillStyle = "rgba(110, 58, 255, 0.1)"
        ctx.fill()

        // Draw points
        for (let i = 0; i < dataPoints; i++) {
          ctx.beginPath()
          ctx.arc(padding + i * xStep, height - padding - data[i] * yScale, 4, 0, Math.PI * 2)
          ctx.fillStyle = "#6E3AFF"
          ctx.fill()
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Draw labels
        ctx.fillStyle = "#2E384D"
        ctx.font = "12px Inter"
        ctx.textAlign = "center"

        // X-axis labels (months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
        for (let i = 0; i < dataPoints; i++) {
          ctx.fillText(months[i], padding + i * xStep, height - padding + 20)
        }

        // Y-axis labels
        ctx.textAlign = "right"
        for (let i = 0; i <= 5; i++) {
          const value = i * 20
          ctx.fillText(value.toString(), padding - 10, height - padding - value * yScale + 5)
        }
      }
    }
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
      {!canvasRef.current && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Text>Loading chart...</Text>
        </div>
      )}
    </div>
  )
}
