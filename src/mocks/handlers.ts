import { http, HttpResponse, delay } from 'msw'
import { mockTurbines } from '../data/mockTurbines'

export const handlers = [
  http.get('/api/turbines', async () => {
    await delay(600)
    return HttpResponse.json(mockTurbines)
  }),
]