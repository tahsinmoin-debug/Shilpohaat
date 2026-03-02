'use client';

import SearchBar from './SearchBar';
import CategoryChips from './CategoryChips';

interface BasicFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function BasicFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  category,
  onCategoryChange,
  categories,
}: BasicFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort artworks"
          className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold min-h-[44px]"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Category Chips */}
      <CategoryChips
        categories={categories}
        selected={category}
        onSelect={onCategoryChange}
      />
    </div>
  );
}
