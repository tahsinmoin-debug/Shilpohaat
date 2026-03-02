'use client';

interface PriceRangeFilterProps {
  min: string;
  max: string;
  onChange: (range: { min: string; max: string }) => void;
}

export default function PriceRangeFilter({
  min,
  max,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm font-semibold block">
        Price (৳)
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => onChange({ min: e.target.value, max })}
          aria-label="Minimum price"
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
        />
        <span className="text-gray-300">-</span>
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => onChange({ min, max: e.target.value })}
          aria-label="Maximum price"
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
        />
      </div>
    </div>
  );
}
