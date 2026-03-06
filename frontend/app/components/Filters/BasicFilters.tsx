'use client';

import SearchBar from './SearchBar';

interface BasicFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function BasicFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: BasicFiltersProps) {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort artworks"
          className="w-full md:w-auto md:min-w-[220px] px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
