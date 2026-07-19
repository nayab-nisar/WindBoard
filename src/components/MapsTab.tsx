import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  stashmapsTileUrl,
  STASHMAPS_DEFAULT_TILE_URL,
  STASHMAPS_ATTRIBUTION,
  toFarmSlug,
} from '../lib/stashmaps'
import type { Turbine } from '../types/turbine'

import '../index.css'

// NOTE: this assumes `Turbine` carries (or can carry) coordinates.
// If your real type doesn't have these yet, add:
//   lat?: number
//   lng?: number
// Turbines missing coordinates are simply skipped on the map.

const STATUS_COLOR: Record<string, string> = {
  online: '#16a34a',   // green-600
  warning: '#eab308',  // yellow-500
  offline: '#ef4444',  // red-500
}

function statusIcon(status: string) {
  const color = STATUS_COLOR[status] ?? '#6b7280'
  return L.divIcon({
    className: 'windboard-turbine-marker',
    html: `<span style="
      display:block;width:14px;height:14px;border-radius:9999px;
      background:${color};border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.15);
    "></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

/** Recenters the map whenever the farm filter changes. */
function RecenterOnFarm({ center }: { center: [number, number] | null }) {
  const map = useMap()
  if (center) {
    map.setView(center, map.getZoom())
  }
  return null
}

type MapsTabProps = {
  filtered: Turbine[]
  farmFilter: string
  onMarkerClick?: (turbine: Turbine) => void
}

export default function MapsTab({ filtered, farmFilter, onMarkerClick }: MapsTabProps) {
  const located = useMemo(
    () => filtered.filter((t): t is Turbine & { lat: number; lng: number } =>
      typeof (t as any).lat === 'number' && typeof (t as any).lng === 'number'
    ),
    [filtered]
  )

  const tileUrl = farmFilter && farmFilter !== 'all'
    ? stashmapsTileUrl(toFarmSlug(farmFilter))
    : STASHMAPS_DEFAULT_TILE_URL

  const center: [number, number] = located.length
    ? [located[0].lat, located[0].lng]
    : [0, 0]

  return (
    <div className="bg-card rounded-xl border overflow-hidden h-[520px]">
      {located.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No turbines with location data match this filter.
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
         <TileLayer
         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           attribution="&copy; OpenStreetMap contributors"
          />
          <RecenterOnFarm center={center} />

          {located.map(turbine => (
            <Marker
              key={turbine.id}
              position={[turbine.lat, turbine.lng]}
              icon={statusIcon((turbine as any).status)}
              eventHandlers={{
                click: () => onMarkerClick?.(turbine),
              }}
            >
        <Tooltip
  direction="top"
  offset={[0, -10]}
  opacity={1}
  permanent={false}
    className="windboard-tooltip"

>
  <div
    className="min-w-[200px] rounded-lg p-3 text-slate-800"
    style={{
      background:
        turbine.status === 'online'
          ? '#dcfce7'
          : turbine.status === 'warning'
          ? '#fef9c3'
          : '#fee2e2',
    }}
  >
    <h3 className="font-bold text-sm mb-3">
      {turbine.name}
    </h3>

    <div className="space-y-2 text-xs">
      <div className="flex justify-between">
        <span>Power</span>
        <span className="font-bold">
          {turbine.powerOutput} kW
        </span>
      </div>

      <div className="flex justify-between">
        <span>Wind</span>
        <span className="font-bold">
          {turbine.windSpeed} m/s
        </span>
      </div>

      <div className="flex justify-between">
        <span>Farm</span>
        <span className="font-bold">
          {turbine.farm}
        </span>
      </div>
    </div>
  </div>
</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  )
}