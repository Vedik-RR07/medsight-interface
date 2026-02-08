import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { SafetyTier } from '../lib/api';

interface RecommendationSectionProps {
  recommendation: string;
  safetyTier: SafetyTier;
  objectionResponses?: Array<{
    objection: string;
    response: string;
  }>;
  vetoReason?: string;
}

export function RecommendationSection({
  recommendation,
  safetyTier,
  objectionResponses = [],
  vetoReason,
}: RecommendationSectionProps) {
  const [showObjections, setShowObjections] = useState(true);

  // Contraindicated - hide recommendation completely
  if (safetyTier === 'contraindicated') {
    return (
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={28} />
          <h2 className="text-xl font-bold text-red-900">
            Recommendation Withheld Due to Safety Concerns
          </h2>
        </div>
        <p className="text-red-800 text-lg mb-4">
          {vetoReason || 'This intervention is not recommended for this patient based on safety analysis.'}
        </p>
        <div className="bg-white rounded-lg p-4 border border-red-300">
          <p className="text-sm text-gray-700">
            <strong>Clinical Action:</strong> Do not proceed with this intervention. Consult with a specialist
            to explore alternative treatment options that are appropriate for this patient's profile.
          </p>
        </div>
      </div>
    );
  }

  // Not recommended - show with strong warning
  if (safetyTier === 'not-recommended') {
    return (
      <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-orange-600 flex-shrink-0" size={24} />
          <h2 className="text-xl font-bold text-orange-900">
            ⚠️ Recommendation Not Recommended for This Patient
          </h2>
        </div>
        <div className="bg-white rounded-lg p-4 border border-orange-300 mb-4">
          <p className="text-gray-800 leading-relaxed">{recommendation}</p>
        </div>
        <p className="text-sm text-orange-800 mb-3">
          <strong>Caution:</strong> Significant safety concerns or demographic gaps exist. This recommendation
          may not be appropriate for this patient. Review objections carefully.
        </p>
        {objectionResponses.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowObjections(!showObjections)}
              className="flex items-center gap-2 text-sm font-semibold text-orange-900 hover:text-orange-700 transition-colors"
            >
              {showObjections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              View Safety Concerns ({objectionResponses.length})
            </button>
            {showObjections && (
              <div className="mt-3 space-y-2">
                {objectionResponses.map((resp, i) => (
                  <div key={i} className="bg-white p-3 rounded border border-orange-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      <AlertTriangle className="inline w-3 h-3 mr-1 text-orange-600" />
                      {resp.objection}
                    </p>
                    <p className="text-sm text-gray-700">{resp.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Caution - show with mild warning
  if (safetyTier === 'caution') {
    return (
      <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
          <h2 className="text-lg font-bold text-yellow-900">
            Recommendation (Use with Caution)
          </h2>
        </div>
        <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-3">
          <p className="text-gray-800 leading-relaxed">{recommendation}</p>
        </div>
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Some demographic differences or minor concerns noted. Review patient-specific
          factors before proceeding.
        </p>
        {objectionResponses.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowObjections(!showObjections)}
              className="flex items-center gap-2 text-sm font-semibold text-yellow-900 hover:text-yellow-700 transition-colors"
            >
              {showObjections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              View Considerations ({objectionResponses.length})
            </button>
            {showObjections && (
              <div className="mt-3 space-y-2">
                {objectionResponses.map((resp, i) => (
                  <div key={i} className="bg-white p-3 rounded border border-yellow-200">
                    <p className="text-sm font-medium text-gray-900 mb-1">{resp.objection}</p>
                    <p className="text-sm text-gray-700">{resp.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Safe - normal display
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Recommendation</h2>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-800 leading-relaxed">{recommendation}</p>
      </div>
      {objectionResponses.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowObjections(!showObjections)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showObjections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Additional Considerations ({objectionResponses.length})
          </button>
          {showObjections && (
            <div className="mt-3 space-y-2">
              {objectionResponses.map((resp, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">{resp.objection}</p>
                  <p className="text-sm text-gray-700">{resp.response}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
