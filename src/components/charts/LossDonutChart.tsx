import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from './ReactECharts'
import { useLossBreakdown } from '../../hooks/useChartData'
import { Skeleton } from '../ui/skeleton'

const CATEGORY_COLORS: Record<string, string> = {
  electrical: '#ef4444',
  mechanical: '#f59e0b',
  wake: '#6366f1',
  curtailment: '#10b981',
  availability: '#3b82f6',
}

export default function LossDonutChart() {
  const { data, isLoading, isError } = useLossBreakdown()

  const option: EChartsOption = useMemo(() => {
    const entries = data ?? []
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} MWh ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'middle',
        textStyle: { fontSize: 11 },
      },
      series: [
        {
          name: 'Loss Breakdown',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold' },
          },
          data: entries.map(e => ({
            name: e.label,
            value: e.value,
            itemStyle: { color: CATEGORY_COLORS[e.category] },
          })),
        },
      ],
    }
  }, [data])

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full rounded-xl" />
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground border rounded-xl bg-card">
        No loss breakdown data available.
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border p-4">
      <h3 className="text-sm font-medium mb-2">Loss Breakdown by Category</h3>
      <ReactECharts option={option} height={320} />
    </div>
  )
}