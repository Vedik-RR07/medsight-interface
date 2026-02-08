import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { SafetyTier } from '../lib/api';

interface SafetyBannerProps {
  safetyTier: SafetyTier;
  summary: string;
}

export function SafetyBanner({ safetyTier, summary }: SafetyBannerProps) {
  const config = {
    contraindicated: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-900',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      label: 'CONTRAINDICATED',
      labelBg: 'bg-red-600',
    },
    'not-recommended': {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      text: 'text-orange-900',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      label: 'NOT RECOMMENDED',
      labelBg: 'bg-orange-600',
    },
    caution: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-900',
      icon: Info,
      iconColor: 'text-yellow-600',
      label: 'CAUTION',
      labelBg: 'bg-yellow-600',
    },
    safe: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      label: 'SAFE',
      labelBg: 'bg-green-600',
    },
  };

  const { bg, border, text, icon: Icon, iconColor, label, labelBg } = config[safetyTier];

  return (
    <div className={`${bg} ${border} border-l-4 p-6 rounded-lg mb-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <Icon className={`${iconColor} flex-shrink-0 mt-1`} size={32} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`${labelBg} text-white px-3 py-1 rounded-full text-sm font-bold`}>
              {label}
            </span>
          </div>
          <p className={`${text} text-lg font-medium leading-relaxed`}>
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
