import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface PromptSuggestionCardProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
}

/**
 * A card component to display a clickable AI prompt suggestion.
 * Features a lightbulb icon and a hover effect to encourage interaction.
 */
export const PromptSuggestionCard: React.FC<PromptSuggestionCardProps> = ({ suggestion, onClick }) => {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className="
        group
        flex items-center justify-between
        w-full p-4
        text-left
        bg-white dark:bg-slate-800/50
        border border-slate-200 dark:border-slate-700
        rounded-xl
        shadow-sm
        hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        transition-all duration-300
        cursor-pointer
      "
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <Lightbulb className="h-6 w-6 text-yellow-400 dark:text-yellow-300" />
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {suggestion}
          </p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  );
};
