import { useEffect, useState } from 'react'
import { useTurbineStatus } from './hooks/useTurbineStatus'
import { useTheme } from './components/theme-provider'
import TurbineCard from './components/TurbineCard'
import TurbineDialog from './components/TurbineDialog'
import ChartsTab from './components/ChartsTab'
import MapsTab from './components/MapsTab'
import ReportsTab from './components/ReportsTab'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Turbine } from './types/turbine'

type FilterOption = { label: string; value: 'all' | 'online' | 'warning' | 'offline' }
type TabKey = 'overview' | 'charts' | 'maps' //| 'reports'

const FILTERS: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Warning', value: 'warning' },
  { label: 'Offline', value: 'offline' },
]

const TABS: { label: string; value: TabKey }[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Charts', value: 'charts' },
  { label: 'Maps', value: 'maps' },
  //{ label: 'Reports', value: 'reports' },
]

export default function App() {
  const {
    filtered,
    filter,
    setFilter,
    farmFilter,
    setFarmFilter,
    farms,
    loading,
    isError,
    error,
    refetch,
    counts,
  } = useTurbineStatus()

  const { theme, toggleTheme } = useTheme()

  const [selectedTurbine, setSelectedTurbine] = useState<Turbine | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const savedTab = localStorage.getItem('windboard-active-tab')
    return (['overview', 'charts', 'maps'] as TabKey[]).includes(savedTab as TabKey)
      ? (savedTab as TabKey)
      : 'overview'
  })

  const [selectedTurbineId, setSelectedTurbineId] = useState<string | null>(null)

  // Each tab lazy-mounts on first visit and then stays mounted (hidden via
  // CSS) so switching back doesn't remount heavy children like the map
  // or re-run chart layout calculations.
  const [visitedTabs, setVisitedTabs] = useState<Record<TabKey, boolean>>(() => {
    const savedTab = localStorage.getItem('windboard-active-tab') as TabKey | null
    return {
      overview: true,
      charts: savedTab === 'charts',
      maps: savedTab === 'maps',
      //reports: savedTab === 'reports',
    }
  })

  useEffect(() => {
    localStorage.setItem('windboard-active-tab', activeTab)
    setVisitedTabs(prev => (prev[activeTab] ? prev : { ...prev, [activeTab]: true }))
  }, [activeTab])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedTurbineId(null)
      return
    }

    const exists = filtered.some(t => t.id === selectedTurbineId)
    if (!exists) {
      setSelectedTurbineId(filtered[0].id)
    }
  }, [filtered, selectedTurbineId])

  const handleCardClick = (turbine: Turbine) => {
    setSelectedTurbine(turbine)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">WindBoard</h1>
            <p className="text-xs text-muted-foreground">Fleet Overview</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {counts.online} / {counts.all} online
            </span>

            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {TABS.map(tab => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
          {isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Failed to load turbines</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error instanceof Error ? error.message : 'Something went wrong'}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">Online</p>
              <p className="text-2xl font-medium text-green-600 mt-1">{counts.online}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">Warning</p>
              <p className="text-2xl font-medium text-yellow-500 mt-1">{counts.warning}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">Offline</p>
              <p className="text-2xl font-medium text-red-500 mt-1">{counts.offline}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2">
              {FILTERS.map(f => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                  <span className="ml-2 text-xs opacity-60">{counts[f.value]}</span>
                </Button>
              ))}
            </div>

            <Select value={farmFilter} onValueChange={setFarmFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farms</SelectItem>
                {farms.map(farm => (
                  <SelectItem key={farm} value={farm}>
                    {farm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border p-5 h-44 space-y-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No turbines match this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(turbine => (
                <TurbineCard
                  key={turbine.id}
                  turbine={turbine}
                  onClick={() => handleCardClick(turbine)}
                />
              ))}
            </div>
          )}
        </div>

        {visitedTabs.charts && (
          <div className={activeTab === 'charts' ? 'block' : 'hidden'}>
            <ChartsTab
              filtered={filtered}
              selectedTurbineId={selectedTurbineId}
              setSelectedTurbineId={setSelectedTurbineId}
              activeTab={activeTab}
              theme={theme}
            />
          </div>
        )}

        {visitedTabs.maps && (
          <div className={activeTab === 'maps' ? 'block' : 'hidden'}>
            <MapsTab
              filtered={filtered}
              farmFilter={farmFilter}
              onMarkerClick={handleCardClick}
            />
          </div>
        )}

        {visitedTabs.reports && (
          <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
            <ReportsTab filtered={filtered} farmFilter={farmFilter} />
          </div>
        )}
      </main>

      <TurbineDialog
        turbine={selectedTurbine}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}