'use client';

interface CategoryChipsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-gray-300 text-sm font-semibold shrink-0">
        Categories:
      </span>
      <div className="flex flex-wrap md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            aria-label={`Filter by ${cat} category`}
            aria-pressed={selected === cat}
            className={`px-3 py-1.5 md:py-1 rounded-full text-sm font-medium transition-all shrink-0 min-h-[44px] md:min-h-0 ${
              selected === cat
                ? 'bg-brand-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
