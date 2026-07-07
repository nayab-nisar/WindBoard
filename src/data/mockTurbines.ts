import type {
  Turbine,
  TimeSeriesPoint,
  FleetPerformanceEntry,
  PowerCurvePoint,
  LossBreakdownEntry,
} from '../types/turbine'

export const mockTurbines: Turbine[] = [
  {
    id: 'T-001',
    name: 'Turbine 1',
    farm: 'Alpha Farm',
    status: 'online',
    powerOutput: 2400,
    windSpeed: 12.3,
    lastUpdated: '2 min ago',
    lat:45,
    lng:55
    
  },
  {
    id: 'T-002',
    name: 'Turbine 2',
    farm: 'Alpha Farm',
    status: 'warning',
    powerOutput: 1800,
    windSpeed: 9.1,
    lastUpdated: '5 min ago',
    lat:50,
    lng:55
  },
  {
    id: 'T-003',
    name: 'Turbine 3',
    farm: 'Alpha Farm',
    status: 'offline',
    powerOutput: 0,
    windSpeed: 3.2,
    lastUpdated: '1 hr ago',
    lat:55,
    lng:65
  },
  {
    id: 'T-004',
    name: 'Turbine 4',
    farm: 'Beta Farm',
    status: 'online',
    powerOutput: 3100,
    windSpeed: 14.7,
    lastUpdated: '1 min ago',
    lat:40,
    lng:35
  },
  {
    id: 'T-005',
    name: 'Turbine 5',
    farm: 'Beta Farm',
    status: 'online',
    powerOutput: 2900,
    windSpeed: 13.5,
    lastUpdated: '3 min ago',
    lat:25,
    lng:35
  },
  {
    id: 'T-006',
    name: 'Turbine 6',
    farm: 'Beta Farm',
    status: 'offline',
    powerOutput: 0,
    windSpeed: 2.8,
    lastUpdated: '2 hr ago',
    
    lat:35,
    lng:55

  },
]

// --- Chart mock data generators (Block 9: ECharts) ---

// Simple deterministic seeded random so each turbine always gets
// the same-looking chart data (instead of changing on every refresh).
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function seedFromId(turbineId: string): number {
  let seed = 0
  for (let i = 0; i < turbineId.length; i++) {
    seed += turbineId.charCodeAt(i) * (i + 1)
  }
  return seed || 1
}

// 7 days x 24 hourly points = 168 points.
// Wind speed follows a sine wave (day/night-ish cycle) + noise.
// Power output is derived from wind speed using a simplified cubic
// power curve, matching how real turbines respond to wind.
export function generateTimeSeries(turbineId: string): TimeSeriesPoint[] {
  const rand = seededRandom(seedFromId(turbineId))
  const points: TimeSeriesPoint[] = []
  const now = new Date()
  const totalHours = 168 // 7 days * 24 hours

  for (let i = totalHours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

    // Base sine wave over a 24h cycle, offset per-turbine so farms don't look identical.
    const hourOfCycle = (totalHours - i) + seedFromId(turbineId) % 24
    const base = 9 + 5 * Math.sin((hourOfCycle / 24) * Math.PI * 2)
    const noise = (rand() - 0.5) * 3
    const windSpeed = Math.max(0, +(base + noise).toFixed(1))

    // Simplified power curve: cubic ramp-up, cutoff/rated above ~13 m/s, cut-out at 25 m/s.
    let powerOutput = 0
    if (windSpeed >= 3 && windSpeed < 13) {
      powerOutput = Math.round(Math.pow(windSpeed / 13, 3) * 3200)
    } else if (windSpeed >= 13 && windSpeed < 25) {
      powerOutput = 3200
    } else {
      powerOutput = 0
    }

    points.push({
      timestamp: timestamp.toISOString(),
      powerOutput,
      windSpeed,
    })
  }

  return points
}

// Wind speed (x) vs power output (y) scatter points for the power curve chart.
// Cubic relationship up to rated wind speed, then a flat cutoff plateau.
export function generatePowerCurve(turbineId: string): PowerCurvePoint[] {
  const rand = seededRandom(seedFromId(turbineId) + 7)
  const points: PowerCurvePoint[] = []

  for (let i = 0; i < 120; i++) {
    const windSpeed = +(rand() * 25).toFixed(1)
    const noise = (rand() - 0.5) * 150

    let powerOutput = 0
    if (windSpeed >= 3 && windSpeed < 13) {
      powerOutput = Math.pow(windSpeed / 13, 3) * 3200 + noise
    } else if (windSpeed >= 13 && windSpeed < 25) {
      powerOutput = 3200 + noise * 0.3
    } else {
      powerOutput = Math.max(0, noise * 0.2)
    }

    points.push({
      windSpeed,
      powerOutput: Math.max(0, Math.round(powerOutput)),
    })
  }

  return points.sort((a, b) => a.windSpeed - b.windSpeed)
}

export const mockLossBreakdown: LossBreakdownEntry[] = [
  { category: 'electrical', label: 'Electrical', value: 42 },
  { category: 'mechanical', label: 'Mechanical', value: 28 },
  { category: 'wake', label: 'Wake Effect', value: 35 },
  { category: 'curtailment', label: 'Curtailment', value: 19 },
  { category: 'availability', label: 'Availability', value: 24 },
]

// Avg power output + capacity factor per turbine, derived from the
// turbine's generated 7-day time series.
export const mockFleetPerformance: FleetPerformanceEntry[] = mockTurbines.map(t => {
  const series = generateTimeSeries(t.id)
  const avgPowerOutput = Math.round(
    series.reduce((sum, p) => sum + p.powerOutput, 0) / series.length
  )
  const ratedCapacity = 3200 // kW, matches the cutoff used above
  const capacityFactor = +((avgPowerOutput / ratedCapacity) * 100).toFixed(1)

  return {
    id: t.id,
    name: t.name,
    farm: t.farm,
    avgPowerOutput,
    capacityFactor,
  }
})