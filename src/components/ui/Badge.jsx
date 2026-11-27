import {
  Check,
  AlertCircle,
  XCircle,
  CircleDot,
  ArrowLeftRight,
  Wrench,
  PauseCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Calendar,
  Loader,
  Eye,
  Circle,
} from 'lucide-react';
import { getStatusMeta } from '@/lib/status';

const ICONS = {
  check: Check,
  'alert-circle': AlertCircle,
  'x-circle': XCircle,
  'circle-dot': CircleDot,
  'arrow-left-right': ArrowLeftRight,
  wrench: Wrench,
  'pause-circle': PauseCircle,
  clock: Clock,
  'check-circle': CheckCircle2,
  'alert-triangle': AlertTriangle,
  ban: Ban,
  calendar: Calendar,
  loader: Loader,
  eye: Eye,
  circle: Circle,
};

const VARIANT_CLASSES = {
  success: 'bg-status-success-bg text-status-success-fg',
  warning: 'bg-status-warning-bg text-status-warning-fg',
  danger: 'bg-status-danger-bg text-status-danger-fg',
  info: 'bg-status-info-bg text-status-info-fg',
  neutral: 'bg-status-neutral-bg text-status-neutral-fg',
  dark: 'bg-ink-900 text-white',
};

export function Badge({ map, value, label: customLabel, variant: customVariant, className = '' }) {
  const meta = map ? getStatusMeta(map, value) : { label: customLabel || value, variant: customVariant || 'neutral', icon: 'circle' };
  const Icon = ICONS[meta.icon] || Circle;
  const colorClass = VARIANT_CLASSES[customVariant || meta.variant] || VARIANT_CLASSES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12.5px] font-medium whitespace-nowrap ${colorClass} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{customLabel || meta.label}</span>
    </span>
  );
}
