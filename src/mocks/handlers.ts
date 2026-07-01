import { http, HttpResponse, delay } from 'msw'
import {
  mockTurbines,
  mockFleetPerformance,
  mockLossBreakdown,
  generateTimeSeries,
  generatePowerCurve,
} from '../data/mockTurbines'

export const handlers = [
  http.get('/api/turbines', async () => {
    await delay(600)
    return HttpResponse.json(mockTurbines)
  }),

  http.get('/api/turbines/:id/timeseries', async ({ params }) => {
    await delay(400)
    const { id } = params
    const turbine = mockTurbines.find(t => t.id === id)

    if (!turbine) {
      return HttpResponse.json(
        { message: `Turbine ${id} not found` },
        { status: 404 }
      )
    }

    const data = generateTimeSeries(id as string)
    return HttpResponse.json(data)
  }),

  http.get('/api/fleet/performance', async () => {
    await delay(500)
    return HttpResponse.json(mockFleetPerformance)
  }),

  http.get('/api/turbines/:id/power-curve', async ({ params }) => {
    await delay(400)
    const { id } = params
    const turbine = mockTurbines.find(t => t.id === id)

    if (!turbine) {
      return HttpResponse.json(
        { message: `Turbine ${id} not found` },
        { status: 404 }
      )
    }

    const data = generatePowerCurve(id as string)
    return HttpResponse.json(data)
  }),

  http.get('/api/losses', async () => {
    await delay(400)
    return HttpResponse.json(mockLossBreakdown)
  }),
]