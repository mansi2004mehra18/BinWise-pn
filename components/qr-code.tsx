"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
}

export default function QRCode({ value, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cellSize = Math.floor(size / 25)
    const actualSize = cellSize * 25
    canvas.width = actualSize
    canvas.height = actualSize

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, actualSize, actualSize)

    // Generate deterministic pattern from value string
    const hash = Array.from(value).reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0
    }, 0)

    ctx.fillStyle = "#1a1a1a"

    // Draw finder patterns (three corners)
    const drawFinder = (x: number, y: number) => {
      // Outer
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinder(1, 1)
    drawFinder(17, 1)
    drawFinder(1, 17)

    // Generate data pattern based on value hash
    let seed = Math.abs(hash)
    const nextRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return seed / 2147483647
    }

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Skip finder pattern areas
        if (
          (row >= 1 && row <= 7 && col >= 1 && col <= 7) ||
          (row >= 1 && row <= 7 && col >= 17 && col <= 23) ||
          (row >= 17 && row <= 23 && col >= 1 && col <= 7)
        ) {
          continue
        }

        if (nextRandom() > 0.55) {
          ctx.fillStyle = "#1a1a1a"
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }

    // Draw text label
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(8 * cellSize, 10 * cellSize, 9 * cellSize, 5 * cellSize)
    ctx.fillStyle = "#16a34a"
    ctx.font = `bold ${cellSize * 1.5}px system-ui`
    ctx.textAlign = "center"
    ctx.fillText("ECO", 12.5 * cellSize, 13 * cellSize)
  }, [value, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-border"
        style={{ width: size, height: size }}
      />
      <p className="font-mono text-xs text-muted-foreground">{value}</p>
    </div>
  )
}
