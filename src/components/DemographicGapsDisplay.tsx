import { Users } from 'lucide-react';
import type { DemographicGap } from '../lib/api';

interface DemographicGapsDisplayProps {
  gaps: DemographicGap[];
}

export function DemographicGapsDisplay({ gaps }: DemographicGapsDisplayProps) {
  if (!gaps || gaps.length === 0) {
    return null;
  }

  const severityColors = {
    minor: 'bg-blue-50 border-blue-300 text-blue-900',
    moderate: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    severe: 'bg-red-50 border-red-300 text-red-900',
  };

  const severityLabels = {
    minor: 'Minor Gap',
    moderate: 'Moderate Gap',
    severe: 'Severe Gap',
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-gray-700" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">
          Demographic Gaps ({gaps.length})
        </h3>
      </div>

      <div className="space-y-4">
        {gaps.map((gap, index) => (
          <div
            key={index}
            className={`${severityColors[gap.severity]} border-l-4 p-4 rounded`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold capitalize">{gap.type} Gap</span>
                <span className="ml-2 px-2 py-1 bg-white rounded text-xs font-medium border border-gray-300">
                  {severityLabels[gap.severity]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <span className="font-medium">Patient:</span>{' '}
                <span className="text-gray-700">{gap.patientValue}</span>
              </div>
              <div>
                <span className="font-medium">Study Population:</span>{' '}
                <span className="text-gray-700">{gap.studyValue}</span>
              </div>
            </div>

            <p className="text-sm mb-2">
              <span className="font-medium">Explanation:</span> {gap.explanation}
            </p>

            <p className="text-sm">
              <span className="font-medium">Impact:</span> {gap.impact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
