import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Turbine, TurbineStatus } from '../types/turbine'

type FilterType = 'all' | TurbineStatus

async function fetchTurbines(): Promise<Turbine[]> {
  const res = await axios.get('/api/turbines')
  return res.data
}

export function useTurbineStatus() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [farmFilter, setFarmFilter] = useState<string>('all')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['turbines'],
    queryFn: fetchTurbines,
  })

  const turbines = data ?? []

  const farms = Array.from(new Set(turbines.map(t => t.farm)))

  const byFarm = farmFilter === 'all'
    ? turbines
    : turbines.filter(t => t.farm === farmFilter)

  const filtered = filter === 'all'
    ? byFarm
    : byFarm.filter(t => t.status === filter)

  const counts = {
    all: byFarm.length,
    online: byFarm.filter(t => t.status === 'online').length,
    warning: byFarm.filter(t => t.status === 'warning').length,
    offline: byFarm.filter(t => t.status === 'offline').length,
  }

  return {
    filtered,
    filter,
    setFilter,
    farmFilter,
    setFarmFilter,
    farms,
    loading: isLoading,
    isError,
    error,
    refetch,
    counts,
  }
}