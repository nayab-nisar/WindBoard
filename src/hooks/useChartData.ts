import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type {
  TimeSeriesPoint,
  FleetPerformanceEntry,
  PowerCurvePoint,
  LossBreakdownEntry,
} from '../types/turbine'

const REFRESH_MS = 30000 // 30s live refresh, per spec

async function fetchTimeSeries(turbineId: string): Promise<TimeSeriesPoint[]> {
  const res = await axios.get(`/api/turbines/${turbineId}/timeseries`)
  return res.data
}

async function fetchFleetPerformance(): Promise<FleetPerformanceEntry[]> {
  const res = await axios.get('/api/fleet/performance')
  return res.data
}

async function fetchPowerCurve(turbineId: string): Promise<PowerCurvePoint[]> {
  const res = await axios.get(`/api/turbines/${turbineId}/power-curve`)
  return res.data
}

async function fetchLossBreakdown(): Promise<LossBreakdownEntry[]> {
  const res = await axios.get('/api/losses')
  return res.data
}

// 7-day power output time series for a single turbine (Line chart + Dual-axis chart).
// Disabled when no turbineId is selected (drill-down not yet active).
export function useTimeSeries(turbineId: string | null) {
  return useQuery({
    queryKey: ['timeseries', turbineId],
    queryFn: () => fetchTimeSeries(turbineId as string),
    enabled: !!turbineId,
    refetchInterval: REFRESH_MS,
  })
}

// Fleet-wide avg power output + capacity factor (Bar chart).
export function useFleetPerformance() {
  return useQuery({
    queryKey: ['fleet-performance'],
    queryFn: fetchFleetPerformance,
    refetchInterval: REFRESH_MS,
  })
}

// Wind speed vs power output scatter points for a single turbine (Power Curve chart).
export function usePowerCurve(turbineId: string | null) {
  return useQuery({
    queryKey: ['power-curve', turbineId],
    queryFn: () => fetchPowerCurve(turbineId as string),
    enabled: !!turbineId,
    refetchInterval: REFRESH_MS,
  })
}

// Fleet-wide loss breakdown by category (Donut chart).
export function useLossBreakdown() {
  return useQuery({
    queryKey: ['loss-breakdown'],
    queryFn: fetchLossBreakdown,
    refetchInterval: REFRESH_MS,
  })
}