import { useEffect, useState, useRef } from 'react'
import { useTurbineStatus } from './hooks/useTurbineStatus'
import { useTheme } from './components/theme-provider'
import TurbineCard from './components/TurbineCard'
import TurbineDialog from './components/TurbineDialog'
import ChartsTab from './components/ChartsTab'
import MapsTab from './components/MapsTab'
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
import { Download } from 'lucide-react'
import type { Turbine } from './types/turbine'

type FilterOption = { label: string; value: 'all' | 'online' | 'warning' | 'offline' }
type TabKey = 'overview' | 'charts' | 'maps'

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
]

// Helper: power value nikalo — handles undefined, null, '-', 0
function getPowerValue(turbine: Turbine): string {
  // Try common field names
  const raw =
    (turbine as any).powerOutput ??
    (turbine as any).power ??
    (turbine as any).currentPower ??
    (turbine as any).activePower ??
    null

  if (raw === null || raw === undefined || raw === '' || raw === '-') return '0'
  return String(raw)
}

// Helper: wind speed nikalo
function getWindSpeed(turbine: Turbine): string {
  const raw =
    (turbine as any).windSpeed ??
    (turbine as any).wind_speed ??
    (turbine as any).windspeed ??
    null
  if (raw === null || raw === undefined || raw === '' || raw === '-') return '0'
  return String(raw)
}

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
  const [reportMenuOpen, setReportMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const savedTab = localStorage.getItem('windboard-active-tab')
    return (['overview', 'charts', 'maps'] as TabKey[]).includes(savedTab as TabKey)
      ? (savedTab as TabKey)
      : 'overview'
  })

  const [selectedTurbineId, setSelectedTurbineId] = useState<string | null>(null)

  const [visitedTabs, setVisitedTabs] = useState<Record<TabKey, boolean>>(() => {
    const savedTab = localStorage.getItem('windboard-active-tab') as TabKey | null
    return {
      overview: true,
      charts: savedTab === 'charts',
      maps: savedTab === 'maps',
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setReportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = (turbine: Turbine) => {
    setSelectedTurbine(turbine)
    setDialogOpen(true)
  }

  // ── Excel (CSV) download ──────────────────────────────────────────────────
  const handleExcelDownload = () => {
    const headers = ['ID', 'Name', 'Farm', 'Status', 'Power (kW)', 'Wind Speed (m/s)']
    const rows = filtered.map(t => [
      t.id,
      t.name,
      t.farm,
      t.status,
      getPowerValue(t),
      getWindSpeed(t),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `windboard-report-${farmFilter}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF download — table format using jsPDF + autoTable ──────────────────
  const handlePdfDownload = async () => {
    // Dynamically import so bundle stays light
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape' })

    // Title
    doc.setFontSize(16)
    doc.text('WindBoard — Turbine Report', 14, 16)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(
      `Farm: ${farmFilter === 'all' ? 'All Farms' : farmFilter}   |   Generated: ${new Date().toLocaleString()}`,
      14,
      23,
    )

    // Summary row
    doc.setTextColor(0)
    doc.setFontSize(11)
    doc.text(
      `Online: ${counts.online}   Warning: ${counts.warning}   Offline: ${counts.offline}   Total: ${counts.all}`,
      14,
      31,
    )

    // Table
    autoTable(doc, {
      startY: 36,
      head: [['ID', 'Name', 'Farm', 'Status', 'Power (kW)', 'Wind Speed (m/s)']],
      body: filtered.map(t => [
        t.id,
        t.name,
        t.farm,
        t.status,
        getPowerValue(t),
        getWindSpeed(t),
      ]),
      headStyles: { fillColor: [30, 30, 30], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 28 },
        5: { cellWidth: 35 },
      },
      didDrawCell: (data) => {
        // Colour-code Status column
        if (data.section === 'body' && data.column.index === 3) {
          const status = String(data.cell.raw ?? '').toLowerCase()
          if (status === 'online') doc.setTextColor(22, 163, 74)
          else if (status === 'warning') doc.setTextColor(202, 138, 4)
          else if (status === 'offline') doc.setTextColor(220, 38, 38)
          else doc.setTextColor(0)
        }
      },
    })

    doc.save(`windboard-report-${farmFilter}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  // ── Unified handler ───────────────────────────────────────────────────────
  const handleDownload = (type: 'excel' | 'pdf') => {
    setReportMenuOpen(false)
    if (type === 'excel') handleExcelDownload()
    else handlePdfDownload()
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

          {/* Filter row */}
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

            {/* Right side controls */}
            <div className="flex items-center gap-3">
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

              {/* Get Report dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportMenuOpen(prev => !prev)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Get Report
                </Button>

                {reportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => handleDownload('excel')}
                    >
                      📊 Excel (.csv)
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => handleDownload('pdf')}
                    >
                      📄 PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
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
      </main>

      <TurbineDialog
        turbine={selectedTurbine}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}