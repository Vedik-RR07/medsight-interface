import type { AnalysisMode } from '../lib/api';

interface ModeSelectorProps {
  mode: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Analysis Mode
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('clinical')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            mode === 'clinical'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'clinical' ? 'border-blue-600' : 'border-gray-400'
              }`}
            >
              {mode === 'clinical' && (
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="font-bold text-gray-900">Clinical Mode</span>
          </div>
          <p className="text-sm text-gray-600">
            Requires complete patient profile. Enforces safety checks and may veto unsafe
            recommendations.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange('research')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            mode === 'research'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'research' ? 'border-blue-600' : 'border-gray-400'
              }`}
            >
              {mode === 'research' && (
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="font-bold text-gray-900">Research Mode</span>
          </div>
          <p className="text-sm text-gray-600">
            Optional patient data. Provides informational warnings without blocking
            recommendations.
          </p>
        </button>
      </div>
    </div>
  );
}
