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
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Patient Profile {isRequired && <span className="text-red-600">*</span>}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age {isRequired && <span className="text-red-600">*</span>}
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={patient.age || ''}
            onChange={(e) => onChange({ ...patient, age: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 45"
          />
          {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sex {isRequired && <span className="text-red-600">*</span>}
          </label>
          <select
            value={patient.sex || ''}
            onChange={(e) => onChange({ ...patient, sex: e.target.value as any })}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.sex ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.sex && <p className="text-red-600 text-xs mt-1">{errors.sex}</p>}
        </div>

        {/* Primary Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Condition {isRequired && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            value={patient.primaryCondition || ''}
            onChange={(e) => onChange({ ...patient, primaryCondition: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.primaryCondition ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Type 2 Diabetes"
          />
          {errors.primaryCondition && (
            <p className="text-red-600 text-xs mt-1">{errors.primaryCondition}</p>
          )}
        </div>
      </div>

      {/* Comorbidities */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comorbidities (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={comorbidityInput}
            onChange={(e) => setComorbidityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComorbidity())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Hypertension"
          />
          <button
            type="button"
            onClick={addComorbidity}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {patient.comorbidities && patient.comorbidities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {patient.comorbidities.map((comorbidity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {comorbidity}
                <button
                  type="button"
                  onClick={() => removeComorbidity(index)}
                  className="hover:text-blue-900"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medications (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={medicationInput}
            onChange={(e) => setMedicationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Metformin"
          />
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {patient.medications && patient.medications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {patient.medications.map((medication, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {medication}
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="hover:text-green-900"
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
