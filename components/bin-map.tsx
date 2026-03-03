"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Bin } from "@/lib/types"

function getFillColor(level: number): string {
  if (level >= 80) return "#dc2626"
  if (level >= 50) return "#f59e0b"
  return "#16a34a"
}

function getFillLabel(level: number): string {
  if (level >= 80) return "Critical"
  if (level >= 50) return "Moderate"
  return "Low"
}

const wasteIcons: Record<string, string> = {
  organic: "🍂",
  recyclable: "♻️",
  hazardous: "☣️",
  general: "🗑️",
}

interface BinMapProps {
  bins: Bin[]
  routeBins?: Bin[]
  height?: string
  onBinClick?: (bin: Bin) => void
  center?: [number, number]
  zoom?: number
}

export default function BinMap({
  bins,
  routeBins,
  height = "500px",
  onBinClick,
  center = [28.6139, 77.209],
  zoom = 12,
}: BinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(center, zoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    bins.forEach((bin) => {
      const color = getFillColor(bin.fill_level)
      const icon = L.divIcon({
        className: "custom-bin-marker",
        html: `<div style="
          background: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
        ">${wasteIcons[bin.waste_type] || "🗑️"}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([bin.lat, bin.lng], { icon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #1a1a1a;">${bin.label}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${bin.area}</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div style="width: ${bin.fill_level}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
            </div>
            <span style="font-weight: 600; font-size: 13px; color: ${color};">${bin.fill_level}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-top: 6px;">
            <span>${getFillLabel(bin.fill_level)}</span>
            <span>${bin.waste_type}</span>
          </div>
        </div>
      `)

      if (onBinClick) {
        marker.on("click", () => onBinClick(bin))
      }
    })

    // Draw route polyline if routeBins are provided
    if (routeBins && routeBins.length > 1) {
      const routeCoords: L.LatLngExpression[] = routeBins.map((b) => [b.lat, b.lng])
      L.polyline(routeCoords, {
        color: "#16a34a",
        weight: 3,
        opacity: 0.8,
        dashArray: "10, 6",
      }).addTo(map)

      // Add numbered markers for route order
      routeBins.forEach((bin, index) => {
        const numIcon = L.divIcon({
          className: "route-number-marker",
          html: `<div style="
            background: #16a34a;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            transform: translate(12px, -12px);
          ">${index + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [0, 22],
        })
        L.marker([bin.lat, bin.lng], { icon: numIcon }).addTo(map)
      })
    }

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [bins, routeBins, center, zoom, onBinClick])

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%", borderRadius: "var(--radius)", zIndex: 0 }}
      role="application"
      aria-label="Waste bin map showing Delhi area"
    />
  )
}
