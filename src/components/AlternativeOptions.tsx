import { Lightbulb } from 'lucide-react';

interface AlternativeOptionsProps {
  alternatives: string[];
}

export function AlternativeOptions({ alternatives }: AlternativeOptionsProps) {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50 border border-purple-300 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-purple-700" size={20} />
        <h3 className="text-lg font-semibold text-purple-900">
          Alternative Options
        </h3>
      </div>

      <ul className="space-y-2">
        {alternatives.map((option, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            <p className="text-gray-800 flex-1 pt-0.5">{option}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
