import type { Turbine, TurbineStatus } from '../types/turbine'
import { Card, CardContent, CardHeader }  from './ui/card';
import { Badge } from './ui/badge'

//C:\Users\Dev7\Desktop\Dev-7\windboard\src\components\ui\button.tsx

interface TurbineCardProps {
  turbine: Turbine
  onClick: () => void
}

const statusConfig: Record<TurbineStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  online:  { label: 'Online',  variant: 'default' },
  warning: { label: 'Warning', variant: 'secondary' },
  offline: { label: 'Offline', variant: 'destructive' },
}

export default function TurbineCard({ turbine, onClick }: TurbineCardProps) {
  const cfg = statusConfig[turbine.status]

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">{turbine.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{turbine.farm}</p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Power Output</p>
            <p className="text-lg font-medium mt-0.5">
              {turbine.powerOutput > 0 ? `${turbine.powerOutput.toLocaleString()} kW` : '—'}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Wind Speed</p>
            <p className="text-lg font-medium mt-0.5">{turbine.windSpeed} m/s</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Updated {turbine.lastUpdated}</p>
      </CardContent>
    </Card>
  )
}