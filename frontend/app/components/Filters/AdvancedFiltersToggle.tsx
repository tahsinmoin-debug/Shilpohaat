'use client';

interface AdvancedFiltersToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
}

export default function AdvancedFiltersToggle({
  isOpen,
  onToggle,
  activeFilterCount,
}: AdvancedFiltersToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="advanced-filters-panel"
      aria-label="Toggle advanced filters"
      className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 relative min-h-[44px]"
    >
      <span className="font-medium">Advanced Filters</span>
      
      {/* Chevron Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>

      {/* Active Filter Count Badge */}
      {activeFilterCount > 0 && (
        <span
          aria-label={`${activeFilterCount} active advanced filters`}
          className="absolute -top-2 -right-2 bg-brand-gold text-gray-900 text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in duration-200"
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
