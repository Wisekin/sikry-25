"use client"

import { useEffect, useRef } from "react"
import { Text } from "@/components/core/typography/Text"

export function SectorDistribution() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample data for sector distribution
  const sectors = [
    { name: "Technology", value: 35, color: "#003C71" },
    { name: "Finance", value: 25, color: "#6E3AFF" },
    { name: "Healthcare", value: 15, color: "#5A697B" },
    { name: "Manufacturing", value: 12, color: "#4BCA81" },
    { name: "Retail", value: 8, color: "#FFC400" },
    { name: "Other", value: 5, color: "#FF4D4D" },
  ]

  useEffect(() => {
    // This is a placeholder for pie chart rendering
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Set dimensions
        const width = canvas.width
        const height = canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 40

        // Draw pie chart
        let startAngle = 0
        const total = sectors.reduce((sum, sector) => sum + sector.value, 0)

        sectors.forEach((sector) => {
          const sliceAngle = (2 * Math.PI * sector.value) / total

          // Draw slice
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
          ctx.closePath()
          ctx.fillStyle = sector.color
          ctx.fill()
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 2
          ctx.stroke()

          // Calculate label position
          const midAngle = startAngle + sliceAngle / 2
          const labelRadius = radius * 0.7
          const labelX = centerX + labelRadius * Math.cos(midAngle)
          const labelY = centerY + labelRadius * Math.sin(midAngle)

          // Draw label if slice is big enough
          if (sector.value / total > 0.05) {
            ctx.fillStyle = "#FFFFFF"
            ctx.font = "bold 12px Inter"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(`${sector.value}%`, labelX, labelY)
          }

          startAngle += sliceAngle
        })
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="relative h-60">
        <canvas ref={canvasRef} width={400} height={240} className="w-full h-full" />
        {!canvasRef.current && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Text>Loading chart...</Text>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sectors.map((sector, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
            <Text size="sm" className="text-secondary">
              {sector.name} ({sector.value}%)
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}
