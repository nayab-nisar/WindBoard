import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from './ReactECharts'
import { useTimeSeries } from '../../hooks/useChartData'
import { Skeleton } from '../ui/skeleton'

interface DualAxisChartProps {
  turbineId: string | null
  turbineName?: string
}

export default function DualAxisChart({ turbineId, turbineName }: DualAxisChartProps) {
  const { data, isLoading, isError } = useTimeSeries(turbineId)

  const option: EChartsOption = useMemo(() => {
    const points = data ?? []
    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['Power Output', 'Wind Speed'],
        top: 0,
      },
      grid: { left: 55, right: 55, top: 40, bottom: 50 },
      xAxis: {
        type: 'category',
        data: points.map(p =>
          new Date(p.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
          })
        ),
        axisLabel: { rotate: 45, fontSize: 10 },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Power (kW)',
          position: 'left',
          axisLine: { show: true, lineStyle: { color: '#6366f1' } },
        },
        {
          type: 'value',
          name: 'Wind (m/s)',
          position: 'right',
          axisLine: { show: true, lineStyle: { color: '#10b981' } },
        },
      ],
      series: [
        {
          name: 'Power Output',
          type: 'line',
          yAxisIndex: 0,
          data: points.map(p => p.powerOutput),
          smooth: true,
          showSymbol: false,
          color: '#6366f1',
        },
        {
          name: 'Wind Speed',
          type: 'line',
          yAxisIndex: 1,
          data: points.map(p => p.windSpeed),
          smooth: true,
          showSymbol: false,
          color: '#10b981',
        },
      ],
    }
  }, [data])

  if (!turbineId) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        Select a turbine to compare power output vs wind speed.
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        No data available for this turbine.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-2">
        Power vs Wind Speed{turbineName ? ` — ${turbineName}` : ''}
      </h3>
      <ReactECharts option={option} height={320} />
    </div>
  )
}