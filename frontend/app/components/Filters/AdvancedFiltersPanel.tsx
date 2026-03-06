'use client';

import { useRef } from 'react';
import { useIsMobile } from '@/app/hooks/useMediaQuery';
import { useFocusTrap } from '@/app/hooks/useFocusTrap';
import CategoryChips from './CategoryChips';
import PriceRangeFilter from './PriceRangeFilter';
import MaterialFilter from './MaterialFilter';
import StatusFilter from './StatusFilter';
import DimensionFilter from './DimensionFilter';

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  priceRange: { min: string; max: string };
  onPriceChange: (range: { min: string; max: string }) => void;
  materials: string[];
  selectedMaterials: string[];
  onMaterialToggle: (material: string) => void;
  statusOptions: Array<{ value: string; label: string; color: string }>;
  status: string;
  onStatusChange: (status: string) => void;
  dimensions: {
    width: { min: string; max: string };
    height: { min: string; max: string };
  };
  onDimensionsChange: (dims: typeof dimensions) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function AdvancedFiltersPanel({
  isOpen,
  onClose,
  priceRange,
  onPriceChange,
  materials,
  selectedMaterials,
  onMaterialToggle,
  statusOptions,
  status,
  onStatusChange,
  dimensions,
  onDimensionsChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: AdvancedFiltersPanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  // Apply focus trap on mobile when panel is open
  useFocusTrap(isMobile && isOpen, panelRef);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        id="advanced-filters-panel"
        role="region"
        aria-label="Advanced filter options"
        className={`
          ${
            isMobile
              ? 'fixed bottom-0 left-0 right-0 z-50 bg-gray-800 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300'
              : 'mt-4 bg-[rgba(6,21,35,0.5)] backdrop-blur-sm rounded-lg border border-white/10 animate-in slide-in-from-top fade-in duration-300'
          }
        `}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Advanced Filters
            </h3>
            <button
              onClick={onClose}
              aria-label="Close advanced filters"
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="px-4 pt-4">
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={onCategoryChange}
          />
        </div>

        <div
          className={`
            p-4 space-y-4
            ${isMobile ? 'max-h-[70vh] overflow-y-auto' : ''}
            md:grid md:grid-cols-2 md:gap-6 md:space-y-0
            lg:grid-cols-3
          `}
        >
          <PriceRangeFilter
            min={priceRange.min}
            max={priceRange.max}
            onChange={onPriceChange}
          />

          <MaterialFilter
            materials={materials}
            selected={selectedMaterials}
            onToggle={onMaterialToggle}
          />

          <StatusFilter
            options={statusOptions}
            selected={status}
            onChange={onStatusChange}
          />

          <DimensionFilter
            dimensions={dimensions}
            onChange={onDimensionsChange}
          />
        </div>
      </div>
    </>
  );
}
