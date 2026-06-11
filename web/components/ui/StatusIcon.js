import { CheckCircle2, PauseCircle, XCircle, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONFIG = {
    ACTIVE:    { Icon: CheckCircle2, className: 'text-green-500' },
    TRIAL:     { Icon: FlaskConical, className: 'text-blue-500' },
    PAUSED:    { Icon: PauseCircle,  className: 'text-amber-500' },
    CANCELLED: { Icon: XCircle,      className: 'text-destructive' },
};

export function StatusIcon({ status, className }) {
    const cfg = CONFIG[status];
    if (!cfg) return null;
    const { Icon, className: colorClass } = cfg;
    return <Icon className={cn('h-4 w-4 shrink-0', colorClass, className)} />;
}
