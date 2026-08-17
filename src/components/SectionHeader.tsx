import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onViewAll,
  viewAllText = 'Ver todo'
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-bold font-serif-craft tracking-tight">
        {title}
      </h2>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-[#60b64d] hover:text-[#4c9d3a] font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>{viewAllText}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
