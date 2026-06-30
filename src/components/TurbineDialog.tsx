import type { Turbine, TurbineStatus } from '../types/turbine'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Badge } from './ui/badge'

interface TurbineDialogProps {
  turbine: Turbine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig: Record<TurbineStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  online:  { label: 'Online',  variant: 'default' },
  warning: { label: 'Warning', variant: 'secondary' },
  offline: { label: 'Offline', variant: 'destructive' },
}

export default function TurbineDialog({ turbine, open, onOpenChange }: TurbineDialogProps) {
  if (!turbine) return null
  const cfg = statusConfig[turbine.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {turbine.name}
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </DialogTitle>
          <DialogDescription>{turbine.farm}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Power Output</p>
            <p className="text-xl font-medium mt-1">
              {turbine.powerOutput > 0 ? `${turbine.powerOutput.toLocaleString()} kW` : '—'}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Wind Speed</p>
            <p className="text-xl font-medium mt-1">{turbine.windSpeed} m/s</p>
          </div>
          <div className="bg-muted rounded-lg p-4 col-span-2">
            <p className="text-xs text-muted-foreground">Turbine ID</p>
            <p className="text-sm font-medium mt-1">{turbine.id}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">Last updated {turbine.lastUpdated}</p>
      </DialogContent>
    </Dialog>
  )
}