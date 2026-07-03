import { useState } from 'react'
import { useTurbineStatus } from '../hooks/useTurbineStatus'
import FleetBarChart from './charts/FleetBarChart'
import PowerLineChart from './charts/PowerLineChart'
import PowerCurveScatter from './charts/PowerCurveScatter'
import DualAxisChart from './charts/DualAxisChart'
import LossDonutChart from './charts/LossDonutChart'

export default function ChartsTab() {
  
    
    const { filtered } = useTurbineStatus()

    const [selectedTurbineId, setSelectedTurbineId] = useState<string | null>(
  () => filtered[0]?.id ?? null)
    const selectedTurbine = filtered.find(t => t.id === selectedTurbineId) ?? null


  const handleBarClick = (turbineId: string) => {
    setSelectedTurbineId(prev => (prev === turbineId ? null : turbineId))
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FleetBarChart onBarClick={handleBarClick} selectedTurbineId={selectedTurbineId} />
        <LossDonutChart />
      </div>

      {/* Per-turbine drill-down charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PowerLineChart turbineId={selectedTurbineId} turbineName={selectedTurbine?.name} />
        <DualAxisChart turbineId={selectedTurbineId} turbineName={selectedTurbine?.name} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <PowerCurveScatter turbineId={selectedTurbineId} turbineName={selectedTurbine?.name} />
      </div>

    </div>
  )
}