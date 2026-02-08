import { useState } from 'react';
import { X } from 'lucide-react';
import type { PatientProfile, AnalysisMode } from '../lib/api';

interface PatientProfileFormProps {
  mode: AnalysisMode;
  patient: Partial<PatientProfile>;
  onChange: (patient: Partial<PatientProfile>) => void;
  errors?: Record<string, string>;
}

export function PatientProfileForm({ mode, patient, onChange, errors = {} }: PatientProfileFormProps) {
  const [comorbidityInput, setComorbidityInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const isRequired = mode === 'clinical';

  const addComorbidity = () => {
    if (comorbidityInput.trim()) {
      onChange({
        ...patient,
        comorbidities: [...(patient.comorbidities || []), comorbidityInput.trim()],
      });
      setComorbidityInput('');
    }
  };

  const removeComorbidity = (index: number) => {
    onChange({
      ...patient,
      comorbidities: patient.comorbidities?.filter((_, i) => i !== index),
    });
  };

  const addMedication = () => {
    if (medicationInput.trim()) {
      onChange({
        ...patient,
        medications: [...(patient.medications || []), medicationInput.trim()],
      });
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    onChange({
      ...patient,
      medications: patient.medications?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="glass-panel border border-border/50 rounded-lg p-6 mb-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Patient Profile {isRequired && <span className="text-destructive">*</span>}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Age {isRequired && <span className="text-destructive">*</span>}
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={patient.age || ''}
            onChange={(e) => onChange({ ...patient, age: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 bg-background/60 border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              errors.age ? 'border-destructive' : 'border-border'
            }`}
            placeholder="e.g., 45"
          />
          {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Sex {isRequired && <span className="text-destructive">*</span>}
          </label>
          <select
            value={patient.sex || ''}
            onChange={(e) => onChange({ ...patient, sex: e.target.value as any })}
            className={`w-full px-3 py-2 bg-background/60 border rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              errors.sex ? 'border-destructive' : 'border-border'
            }`}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.sex && <p className="text-destructive text-xs mt-1">{errors.sex}</p>}
        </div>

        {/* Primary Condition */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Primary Condition {isRequired && <span className="text-destructive">*</span>}
          </label>
          <input
            type="text"
            value={patient.primaryCondition || ''}
            onChange={(e) => onChange({ ...patient, primaryCondition: e.target.value })}
            className={`w-full px-3 py-2 bg-background/60 border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
              errors.primaryCondition ? 'border-destructive' : 'border-border'
            }`}
            placeholder="e.g., Type 2 Diabetes"
          />
          {errors.primaryCondition && (
            <p className="text-destructive text-xs mt-1">{errors.primaryCondition}</p>
          )}
        </div>
      </div>

      {/* Comorbidities */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">
          Comorbidities (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={comorbidityInput}
            onChange={(e) => setComorbidityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComorbidity())}
            className="flex-1 px-3 py-2 bg-background/60 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g., Hypertension"
          />
          <button
            type="button"
            onClick={addComorbidity}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {patient.comorbidities && patient.comorbidities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {patient.comorbidities.map((comorbidity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
              >
                {comorbidity}
                <button
                  type="button"
                  onClick={() => removeComorbidity(index)}
                  className="hover:text-primary/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Medications (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={medicationInput}
            onChange={(e) => setMedicationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
            className="flex-1 px-3 py-2 bg-background/60 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g., Metformin"
          />
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {patient.medications && patient.medications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {patient.medications.map((medication, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm border border-secondary/30"
              >
                {medication}
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="hover:text-secondary-foreground/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
