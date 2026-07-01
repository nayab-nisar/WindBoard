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