export type TurbineStatus = 'online' | 'warning' | 'offline'

export interface Turbine {
  id: string
  name: string
  farm: string
  status: TurbineStatus
  windSpeed?: number   
  powerOutput?: number      
  lastUpdated?: string
  lat?: number        
  lng?: number         
}


export interface TimeSeriesPoint {
  timestamp: string   
  powerOutput: number 
  windSpeed: number   
}

export interface FleetPerformanceEntry {
  id: string
  name: string
  farm: string
  avgPowerOutput: number 
  capacityFactor: number 
}

export interface PowerCurvePoint {
  windSpeed: number   
  powerOutput: number 
}

export type LossCategory = 'electrical' | 'mechanical' | 'wake' | 'curtailment' | 'availability'

export interface LossBreakdownEntry {
  category: LossCategory
  label: string
  value: number 
}