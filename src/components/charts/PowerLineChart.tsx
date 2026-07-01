import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from './ReactECharts'
import { useTimeSeries } from '../../hooks/useChartData'
import { Skeleton } from '../ui/skeleton'

interface PowerLineChartProps {
  turbineId: string | null
  turbineName?: string
}

export default function PowerLineChart({ turbineId, turbineName }: PowerLineChartProps) {
  const { data, isLoading, isError } = useTimeSeries(turbineId)

  const option: EChartsOption = useMemo(() => {
    const points = data ?? []
    return {
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value) => `${(value as number).toLocaleString()} kW`,
      },
      legend: {
        data: ['Power Output'],
        top: 0,
      },
      grid: { left: 50, right: 20, top: 40, bottom: 50 },
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
      yAxis: {
        type: 'value',
        name: 'kW',
        axisLabel: { formatter: '{value}' },
      },
      series: [
        {
          name: 'Power Output',
          type: 'line',
          data: points.map(p => p.powerOutput),
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.12 },
          lineStyle: { width: 2 },
          color: '#6366f1',
        },
      ],
    }
  }, [data])

  if (!turbineId) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        Select a turbine from the bar chart to view its 7-day power output.
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        No time series data available for this turbine.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-2">
        7-Day Power Output{turbineName ? ` — ${turbineName}` : ''}
      </h3>
      <ReactECharts option={option} height={320} />
    </div>
  )
}