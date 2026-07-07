// --- Core turbine type ---

export type TurbineStatus = 'online' | 'warning' | 'offline'

export interface Turbine {
  id: string
  name: string
  farm: string
  status: TurbineStatus
  windSpeed?: number   // m/s, current reading
  powerOutput?: number       // kW, current output
  lastUpdated?: string
  lat?: number         // latitude, for map placement
  lng?: number         // longitude, for map placement
}

// --- Chart-related types (Block 9: ECharts) ---

export interface TimeSeriesPoint {
  timestamp: string   // ISO date string
  powerOutput: number // kW
  windSpeed: number   // m/s
}

export interface FleetPerformanceEntry {
  id: string
  name: string
  farm: string
  avgPowerOutput: number // kW, avg over last 7 days
  capacityFactor: number // %
}

export interface PowerCurvePoint {
  windSpeed: number   // m/s
  powerOutput: number // kW
}

export type LossCategory = 'electrical' | 'mechanical' | 'wake' | 'curtailment' | 'availability'

export interface LossBreakdownEntry {
  category: LossCategory
  label: string
  value: number // MWh lost
}