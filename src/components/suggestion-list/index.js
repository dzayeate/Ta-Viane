import React from 'react';
import { useTranslation } from 'next-i18next';

const SuggestionList = ({ 
  activeSuggestionIndex, 
  onSuggestionClick,
  position,
  query = ''
}) => {
  const { t } = useTranslation('common');
  
  // Get all suggestions from translations
  const getSuggestions = () => {
    const suggestionKeys = [
      'simple',
      'illustrated',
      'examModel',
      'hots',
      'shortAnswer',
      'story',
      'quadratic',
      'limit',
      'derivative',
      'integral',
      'statistics',
      'algebra',
      'trigonometry',
      'calculus',
      'geometry',
      'probability',
      'numberTheory',
      'linearAlgebra',
      'discreteMath',
      'mathLogic'
    ];

    return suggestionKeys.map(key => ({
      key,
      label: t(`suggestions.${key}.label`),
      value: t(`suggestions.${key}.value`)
    }));
  };

  const suggestions = getSuggestions();

  const filteredSuggestions = query 
    ? suggestions.filter(s => 
        s.value.toLowerCase().includes(query.toLowerCase()) ||
        s.label.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions;

  if (activeSuggestionIndex === null || filteredSuggestions.length === 0) {
    return null;
  }

  return (
      <div 
        className="absolute mt-2 z-[9] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        style={position}
        onMouseDown={(e) => e.preventDefault()} 
      >
      <ul>
        {filteredSuggestions.map((s, sIndex) => (
          <li
            key={s.key}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            onMouseDown={(e) => onSuggestionClick(activeSuggestionIndex, s.value, e)}
          >
            <strong className="text-blue-600">{s.label}:</strong> {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionList;