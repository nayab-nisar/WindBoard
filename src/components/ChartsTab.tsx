import type { Turbine } from '../types/turbine'
import FleetBarChart from './charts/FleetBarChart'
import PowerLineChart from './charts/PowerLineChart'
import PowerCurveScatter from './charts/PowerCurveScatter'
import DualAxisChart from './charts/DualAxisChart'
import LossDonutChart from './charts/LossDonutChart'

type ChartsTabProps = {
  filtered: Turbine[]
  selectedTurbineId: string | null
  setSelectedTurbineId: React.Dispatch<React.SetStateAction<string | null>>
  activeTab: 'overview' | 'charts'
  theme: 'light' | 'dark'
}

export default function ChartsTab({
  filtered,
  selectedTurbineId,
  setSelectedTurbineId,
  activeTab,
  theme,
}: ChartsTabProps) {
  const selectedTurbine =
    filtered.find(t => t.id === selectedTurbineId) ?? null

  const handleBarClick = (turbineId: string) => {
    setSelectedTurbineId(prev => (prev === turbineId ? null : turbineId))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FleetBarChart
          key={`fleet-${theme}-${activeTab}`}
          onBarClick={handleBarClick}
          selectedTurbineId={selectedTurbineId}
        />
        <LossDonutChart key={`loss-${theme}-${activeTab}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PowerLineChart
          key={`powerline-${theme}-${activeTab}-${selectedTurbineId ?? 'none'}`}
          turbineId={selectedTurbineId}
          turbineName={selectedTurbine?.name}
        />
        <DualAxisChart
          key={`dual-${theme}-${activeTab}-${selectedTurbineId ?? 'none'}`}
          turbineId={selectedTurbineId}
          turbineName={selectedTurbine?.name}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <PowerCurveScatter
          key={`curve-${theme}-${activeTab}-${selectedTurbineId ?? 'none'}`}
          turbineId={selectedTurbineId}
          turbineName={selectedTurbine?.name}
        />
      </div>
    </div>
  )
}