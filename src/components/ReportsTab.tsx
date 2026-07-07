import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import type { Turbine } from '../types/turbine'

/**
 * Reporting module — unified multi-format export flow
 * ------------------------------------------------------------------
 * Both exports share one job: turn the currently filtered turbine
 * list into a report. They branch only at the very end, at the
 * "build the file" step:
 *
 *   filtered turbines
 *        │
 *        ├── buildReportRows()   (shared: same columns, same order)
 *        │
 *        ├── PDF path:  jsPDF (doc shell + header/footer)
 *        │              └─ jspdf-autotable (renders buildReportRows() as a table)
 *        │              └─ file-saver (doc.save() actually already triggers
 *        │                 the browser download, but we route everything
 *        │                 through file-saver for a single, consistent
 *        │                 "save this Blob" call site — see saveBlob())
 *        │
 *        └── Excel path: ExcelJS (workbook + worksheet + styled header row)
 *                       └─ file-saver (saveAs on the workbook's Blob)
 *
 * Keeping row-building shared means the PDF and Excel exports can
 * never drift out of sync in terms of which columns/status labels
 * appear in each report.
 */

type ReportsTabProps = {
  filtered: Turbine[]
  farmFilter: string
}

const COLUMNS = ['ID', 'Name', 'Farm', 'Status', 'Wind speed', 'Power output'] as const

function buildReportRows(turbines: Turbine[]): string[][] {
  return turbines.map(t => {
    const any = t as any
    return [
      String(t.id),
      String(any.name ?? '—'),
      String(any.farm ?? '—'),
      String(any.status ?? '—'),
      any.windSpeed != null ? `${any.windSpeed} m/s` : '—',
      any.power != null ? `${any.power} kW` : '—',
    ]
  })
}

async function saveBlob(blob: Blob, filename: string) {
  saveAs(blob, filename)
}

async function exportPdf(filtered: Turbine[], farmFilter: string) {
  const doc = new jsPDF()
  const generatedAt = new Date().toLocaleString()

  doc.setFontSize(16)
  doc.text('WindBoard Fleet Report', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Farm: ${farmFilter === 'all' ? 'All farms' : farmFilter}`, 14, 25)
  doc.text(`Generated: ${generatedAt}`, 14, 30)

  autoTable(doc, {
    startY: 36,
    head: [[...COLUMNS]],
    body: buildReportRows(filtered),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] }, // slate-800, matches dashboard tone
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  const blob = doc.output('blob')
  await saveBlob(blob, `windboard-report-${Date.now()}.pdf`)
}

async function exportExcel(filtered: Turbine[], farmFilter: string) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'WindBoard'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Fleet Report')

  sheet.addRow([`Farm: ${farmFilter === 'all' ? 'All farms' : farmFilter}`])
  sheet.addRow([`Generated: ${new Date().toLocaleString()}`])
  sheet.addRow([])

  const headerRow = sheet.addRow([...COLUMNS])
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
  })

  buildReportRows(filtered).forEach(row => sheet.addRow(row))

  sheet.columns.forEach(col => {
    col.width = 18
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  await saveBlob(blob, `windboard-report-${Date.now()}.xlsx`)
}

export default function ReportsTab({ filtered, farmFilter }: ReportsTabProps) {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format)
    try {
      if (format === 'pdf') {
        await exportPdf(filtered, farmFilter)
      } else {
        await exportExcel(filtered, farmFilter)
      }
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div>
        <h2 className="text-sm font-medium">Fleet Report</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Exports the {filtered.length} turbine{filtered.length === 1 ? '' : 's'} matching
          your current filters ({farmFilter === 'all' ? 'all farms' : farmFilter}).
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null || filtered.length === 0}
        >
          {exporting === 'pdf' ? 'Generating PDF…' : 'Export PDF'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExport('excel')}
          disabled={exporting !== null || filtered.length === 0}
        >
          {exporting === 'excel' ? 'Generating Excel…' : 'Export Excel'}
        </Button>
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No turbines match the current filter, so there's nothing to export yet.
        </p>
      )}
    </div>
  )
}