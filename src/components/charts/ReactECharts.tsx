import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useTheme } from '../theme-provider'

interface ReactEChartsProps {
  option: EChartsOption
  loading?: boolean
  height?: number | string
  onEvents?: Record<string, (params: any) => void>
  className?: string
}

export default function ReactECharts({
  option,
  loading = false,
  height = 320,
  onEvents,
  className,
}: ReactEChartsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const chart = echarts.init(
      containerRef.current,
      theme === 'dark' ? 'dark' : undefined
    )
    chartRef.current = chart

    return () => {
      chart.dispose()
      chartRef.current = null
    }
  }, [theme])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.setOption(option, true)
  }, [option])

  useEffect(() => {
    if (!chartRef.current) return
    if (loading) {
      chartRef.current.showLoading('default', {
        text: 'Loading...',
        color: '#6366f1',
        textColor: theme === 'dark' ? '#e5e7eb' : '#374151',
        maskColor: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
        zlevel: 0,
      })
    } else {
      chartRef.current.hideLoading()
    }
  }, [loading, theme])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !onEvents) return

    Object.entries(onEvents).forEach(([eventName, handler]) => {
      chart.on(eventName, handler)
    })

    return () => {
      Object.keys(onEvents).forEach(eventName => {
        chart.off(eventName)
      })
    }
  }, [onEvents])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.resize()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height }}
    />
  )
}
