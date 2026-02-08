import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { ClinicalAlert } from '../lib/api';

interface ClinicalAlertsProps {
  alerts: ClinicalAlert[];
}

export function ClinicalAlerts({ alerts }: ClinicalAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-sm">No specific clinical alerts identified</p>
      </div>
    );
  }

  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      icon: 'text-red-600',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      icon: 'text-orange-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg mb-6 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">
            Clinical Alerts ({alerts.length})
          </h3>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity];
            return (
              <div
                key={index}
                className={`${config.bg} ${config.border} border-l-4 p-4 rounded`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`${config.icon} flex-shrink-0 mt-0.5`} size={18} />
                  <div className="flex-1">
                    <p className={`${config.text} font-medium mb-1`}>
                      {alert.message}
                    </p>
                    {alert.citations && alert.citations.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Sources:</span>{' '}
                        {alert.citations.join(', ')}
                      </p>
                    )}
                    <span className="inline-block mt-2 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-300">
                      {alert.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
