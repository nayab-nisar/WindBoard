import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from './ReactECharts'
import { useFleetPerformance } from '../../hooks/useChartData'
import { Skeleton } from '../ui/skeleton'

interface FleetBarChartProps {
  onBarClick: (turbineId: string) => void
  selectedTurbineId?: string | null
}

export default function FleetBarChart({ onBarClick, selectedTurbineId }: FleetBarChartProps) {
  const { data, isLoading, isError } = useFleetPerformance()

  const option: EChartsOption = useMemo(() => {
    const entries = data ?? []
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          const entry = entries[p.dataIndex]
          return `<strong>${entry.name}</strong><br/>
            Avg Power: ${entry.avgPowerOutput.toLocaleString()} kW<br/>
            Capacity Factor: ${entry.capacityFactor}%`
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 60 },
      xAxis: {
        type: 'category',
        data: entries.map(e => e.name),
        axisLabel: { rotate: 30, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'kW',
      },
      series: [
        {
          name: 'Avg Power Output',
          type: 'bar',
          data: entries.map(e => ({
            value: e.avgPowerOutput,
            itemStyle: {
              color: e.id === selectedTurbineId ? '#f59e0b' : '#6366f1',
            },
          })),
          barWidth: '50%',
          cursor: 'pointer',
        },
      ],
    }
  }, [data, selectedTurbineId])

  // click → resolve dataIndex back to turbine id, fire drill-down callback
  const onEvents = useMemo(
    () => ({
      click: (params: any) => {
        const entries = data ?? []
        const entry = entries[params.dataIndex]
        if (entry) onBarClick(entry.id)
      },
    }),
    [data, onBarClick]
  )

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        No fleet performance data available.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-2">Fleet Performance Comparison</h3>
      <p className="text-xs text-muted-foreground mb-2">Click a bar to drill down into that turbine.</p>
      <ReactECharts option={option} height={320} onEvents={onEvents} />
    </div>
  )
}