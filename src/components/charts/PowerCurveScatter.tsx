import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from './ReactECharts'
import { usePowerCurve } from '../../hooks/useChartData'
import { Skeleton } from '../ui/skeleton'

interface PowerCurveScatterProps {
  turbineId: string | null
  turbineName?: string
}

export default function PowerCurveScatter({ turbineId, turbineName }: PowerCurveScatterProps) {
  const { data, isLoading, isError } = usePowerCurve(turbineId)

  const option: EChartsOption = useMemo(() => {
    const points = data ?? []
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) =>
          `Wind: ${params.value[0]} m/s<br/>Power: ${params.value[1].toLocaleString()} kW`,
      },
      grid: { left: 60, right: 20, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: 'Wind Speed (m/s)',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'value',
        name: 'Power (kW)',
      },
      series: [
        {
          name: 'Power Curve',
          type: 'scatter',
          symbolSize: 6,
          data: points.map(p => [p.windSpeed, p.powerOutput]),
          color: '#10b981',
        },
      ],
    }
  }, [data])

  if (!turbineId) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        Select a turbine to view its power curve.
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        No power curve data available for this turbine.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-2">
        Power Curve{turbineName ? ` — ${turbineName}` : ''}
      </h3>
      <ReactECharts option={option} height={320} />
    </div>
  )
}