import { cn } from '@/lib/utils';

export type StatusColor = 'green' | 'orange' | 'red' | 'gray';

interface StatusBadgeProps {
  color: StatusColor;
  label: string;
  className?: string;
}

const colorStyles: Record<StatusColor, string> = {
  green: 'bg-emerald-500 text-white',
  orange: 'bg-amber-500 text-white',
  red: 'bg-red-500 text-white',
  gray: 'bg-gray-400 text-white',
};

const dotStyles: Record<StatusColor, string> = {
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

export function StatusBadge({ color, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorStyles[color],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full bg-white/80')} />
      {label}
    </span>
  );
}

export function StatusDot({ color, pulse = false, className }: { color: StatusColor; pulse?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        dotStyles[color],
        pulse && 'animate-pulse',
        className
      )}
    />
  );
}

export function StatusCard({ 
  title, 
  value, 
  color, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  color: StatusColor;
  icon: React.ElementType;
  trend?: { value: number; label: string };
}) {
  const borderColors: Record<StatusColor, string> = {
    green: 'border-emerald-200 bg-emerald-50/50',
    orange: 'border-amber-200 bg-amber-50/50',
    red: 'border-red-200 bg-red-50/50',
    gray: 'border-gray-200 bg-gray-50/50',
  };

  const iconColors: Record<StatusColor, string> = {
    green: 'text-emerald-600 bg-emerald-100',
    orange: 'text-amber-600 bg-amber-100',
    red: 'text-red-600 bg-red-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  return (
    <div className={cn('rounded-xl border p-4', borderColors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              'mt-1 text-xs',
              trend.value > 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2', iconColors[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// Helper pour déterminer la couleur selon le statut de l'agent
export function getAgentStatusColor(status: string): StatusColor {
  switch (status) {
    case 'LICENCE_ACTIVE':
    case 'QIP_VALIDE':
    case 'DLAA_DELIVRE':
      return 'green';
    case 'DOCUMENTS_SOUMIS':
    case 'EN_ATTENTE':
      return 'orange';
    case 'QIP_REJETE':
    case 'DLAA_REJETE':
    case 'LICENCE_EXPIREE':
    case 'LICENCE_SUSPENDUE':
      return 'red';
    default:
      return 'gray';
  }
}

// Helper pour déterminer la couleur selon le statut du document
export function getDocumentStatusColor(status: string): StatusColor {
  switch (status) {
    case 'VALIDE':
      return 'green';
    case 'EN_ATTENTE':
      return 'orange';
    case 'REJETE':
      return 'red';
    default:
      return 'gray';
  }
}

// Helper pour déterminer la couleur selon le statut de la licence
export function getLicenseStatusColor(status: string): StatusColor {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'EXPIREE':
    case 'SUSPENDUE':
    case 'REVOQUEE':
      return 'red';
    default:
      return 'gray';
  }
}

// Helper pour les jours restants avant expiration
export function getExpirationColor(daysRemaining: number): StatusColor {
  if (daysRemaining > 30) return 'green';
  if (daysRemaining > 7) return 'orange';
  return 'red';
}
