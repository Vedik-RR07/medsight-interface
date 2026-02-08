import type { AnalysisMode } from '../lib/api';

interface ModeSelectorProps {
  mode: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-foreground mb-3">
        Analysis Mode
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('clinical')}
          className={`p-4 rounded-lg border-2 text-left transition-all backdrop-blur-sm ${
            mode === 'clinical'
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'clinical' ? 'border-primary' : 'border-muted-foreground'
              }`}
            >
              {mode === 'clinical' && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-bold text-foreground">Clinical Mode</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Requires complete patient profile. Enforces safety checks and may veto unsafe
            recommendations.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange('research')}
          className={`p-4 rounded-lg border-2 text-left transition-all backdrop-blur-sm ${
            mode === 'research'
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                mode === 'research' ? 'border-primary' : 'border-muted-foreground'
              }`}
            >
              {mode === 'research' && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="font-bold text-foreground">Research Mode</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Optional patient data. Provides informational warnings without blocking
            recommendations.
          </p>
        </button>
      </div>
    </div>
  );
}
