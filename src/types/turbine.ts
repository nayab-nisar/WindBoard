export type TurbineStatus = 'online' | 'offline' | 'warning'

export interface Turbine {
  id: string
  name: string
  farm: string
  status: TurbineStatus
  powerOutput: number   // kW
  windSpeed: number     // m/s
  lastUpdated: string
}