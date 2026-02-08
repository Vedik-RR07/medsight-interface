import { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

interface PatientExplanationProps {
  explanation: string;
}

export function PatientExplanation({ explanation }: PatientExplanationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-blue-700" size={20} />
          <h3 className="text-lg font-semibold text-blue-900">
            Patient-Friendly Explanation
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy for Patient
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>
      </div>

      <p className="text-xs text-blue-700 mt-3">
        This explanation is written in plain language to help patients understand the findings.
        Always discuss with your healthcare provider for personalized guidance.
      </p>
    </div>
  );
}
