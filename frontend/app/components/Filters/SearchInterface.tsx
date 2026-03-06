'use client';

import { useState, useMemo, useCallback } from 'react';
import BasicFilters from './BasicFilters';
import AdvancedFiltersToggle from './AdvancedFiltersToggle';
import AdvancedFiltersPanel from './AdvancedFiltersPanel';
import {
  applyFilters,
  calculateActiveFilters,
  getDefaultFilters,
  type FilterState,
} from '@/app/utils/filterUtils';

interface Artwork {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
  material?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  artist: {
    _id: string;
    name: string;
    artistProfile: {
      profilePicture: string;
      availability: string;
    };
  };
}

interface SearchInterfaceProps {
  artworks: Artwork[];
  onFilteredResultsChange: (filtered: Artwork[]) => void;
}

const CATEGORIES = [
  'All',
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern Art',
  'Traditional Art',
  'Nature & Wildlife',
  'Cityscape',
  'Floral Art',
  'Minimalist',
  'Pop Art',
  'Digital Art',
];

const MATERIALS = [
  'Acrylic',
  'Oil',
  'Watercolor',
  'Digital',
  'Mixed Media',
  'Charcoal',
  'Pastel',
  'Ink',
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status', color: 'gray' },
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'sold', label: 'Sold', color: 'red' },
  { value: 'reserved', label: 'Reserved', color: 'yellow' },
];

export default function SearchInterface({
  artworks,
  onFilteredResultsChange,
}: SearchInterfaceProps) {
  // Filter State
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());

  // UI State
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);

  // Calculate filtered results with memoization
  const filteredArtworks = useMemo(() => {
    return applyFilters(artworks, filters);
  }, [artworks, filters]);

  // Calculate active advanced filter count with memoization
  const activeFilterCount = useMemo(() => {
    return calculateActiveFilters(filters);
  }, [filters]);

  // Update parent component when filtered results change
  useMemo(() => {
    onFilteredResultsChange(filteredArtworks);
  }, [filteredArtworks, onFilteredResultsChange]);

  // Filter change handlers
  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy: sortBy as FilterState['sortBy'] }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const handlePriceChange = useCallback(
    (priceRange: { min: string; max: string }) => {
      setFilters((prev) => ({ ...prev, priceRange }));
    },
    []
  );

  const handleMaterialToggle = useCallback((material: string) => {
    setFilters((prev) => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter((m) => m !== material)
        : [...prev.materials, material],
    }));
  }, []);

  const handleStatusChange = useCallback(
    (status: string) => {
      setFilters((prev) => ({ ...prev, status: status as FilterState['status'] }));
    },
    []
  );

  const handleDimensionsChange = useCallback(
    (dimensions: FilterState['dimensions']) => {
      setFilters((prev) => ({ ...prev, dimensions }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
    setIsAdvancedPanelOpen(false);
  }, []);

  const handleToggleAdvanced = useCallback(() => {
    setIsAdvancedPanelOpen((prev) => !prev);
  }, []);

  return (
    <div className="bg-[rgba(6,21,35,0.45)] backdrop-blur-md border-b border-white/10 md:sticky md:top-20 z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Basic Filters */}
        <BasicFilters
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={filters.sortBy}
          onSortChange={handleSortChange}
        />

        {/* Advanced Filters Toggle and Clear Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 md:mt-4">
          <AdvancedFiltersToggle
            isOpen={isAdvancedPanelOpen}
            onToggle={handleToggleAdvanced}
            activeFilterCount={activeFilterCount}
          />

          {/* Clear All Filters Button */}
          {(filters.category !== 'All' ||
            filters.searchQuery ||
            activeFilterCount > 0) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold min-h-[44px]"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        <AdvancedFiltersPanel
          isOpen={isAdvancedPanelOpen}
          onClose={() => setIsAdvancedPanelOpen(false)}
          priceRange={filters.priceRange}
          onPriceChange={handlePriceChange}
          materials={MATERIALS}
          selectedMaterials={filters.materials}
          onMaterialToggle={handleMaterialToggle}
          statusOptions={STATUS_OPTIONS}
          status={filters.status}
          onStatusChange={handleStatusChange}
          dimensions={filters.dimensions}
          onDimensionsChange={handleDimensionsChange}
          categories={CATEGORIES}
          selectedCategory={filters.category}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
}
