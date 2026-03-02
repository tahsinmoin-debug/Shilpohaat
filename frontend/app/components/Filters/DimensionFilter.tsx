'use client';

import { useState, useEffect } from 'react';

interface DimensionRange {
  width: { min: string; max: string };
  height: { min: string; max: string };
}

interface DimensionFilterProps {
  dimensions: DimensionRange;
  onChange: (dimensions: DimensionRange) => void;
}

export default function DimensionFilter({
  dimensions,
  onChange,
}: DimensionFilterProps) {
  const [errors, setErrors] = useState({ width: false, height: false });

  // Validate dimensions
  useEffect(() => {
    const widthMin = Number(dimensions.width.min);
    const widthMax = Number(dimensions.width.max);
    const heightMin = Number(dimensions.height.min);
    const heightMax = Number(dimensions.height.max);

    setErrors({
      width:
        dimensions.width.min &&
        dimensions.width.max &&
        widthMin > widthMax,
      height:
        dimensions.height.min &&
        dimensions.height.max &&
        heightMin > heightMax,
    });
  }, [dimensions]);

  return (
    <div className="space-y-3">
      <label className="text-gray-300 text-sm font-semibold block">
        Dimensions (cm)
      </label>

      {/* Width */}
      <div className="space-y-1">
        <label className="text-gray-400 text-xs block">Width</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={dimensions.width.min}
            onChange={(e) =>
              onChange({
                ...dimensions,
                width: { ...dimensions.width, min: e.target.value },
              })
            }
            aria-label="Minimum width in centimeters"
            className={`w-full px-2 py-2 bg-gray-700 text-white border rounded-md text-sm focus:outline-none focus:ring-2 min-h-[44px] ${
              errors.width
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-brand-gold'
            }`}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={dimensions.width.max}
            onChange={(e) =>
              onChange({
                ...dimensions,
                width: { ...dimensions.width, max: e.target.value },
              })
            }
            aria-label="Maximum width in centimeters"
            className={`w-full px-2 py-2 bg-gray-700 text-white border rounded-md text-sm focus:outline-none focus:ring-2 min-h-[44px] ${
              errors.width
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-brand-gold'
            }`}
          />
        </div>
        {errors.width && (
          <p className="text-red-400 text-xs" role="alert">
            Minimum must be less than or equal to maximum
          </p>
        )}
      </div>

      {/* Height */}
      <div className="space-y-1">
        <label className="text-gray-400 text-xs block">Height</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={dimensions.height.min}
            onChange={(e) =>
              onChange({
                ...dimensions,
                height: { ...dimensions.height, min: e.target.value },
              })
            }
            aria-label="Minimum height in centimeters"
            className={`w-full px-2 py-2 bg-gray-700 text-white border rounded-md text-sm focus:outline-none focus:ring-2 min-h-[44px] ${
              errors.height
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-brand-gold'
            }`}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={dimensions.height.max}
            onChange={(e) =>
              onChange({
                ...dimensions,
                height: { ...dimensions.height, max: e.target.value },
              })
            }
            aria-label="Maximum height in centimeters"
            className={`w-full px-2 py-2 bg-gray-700 text-white border rounded-md text-sm focus:outline-none focus:ring-2 min-h-[44px] ${
              errors.height
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:ring-brand-gold'
            }`}
          />
        </div>
        {errors.height && (
          <p className="text-red-400 text-xs" role="alert">
            Minimum must be less than or equal to maximum
          </p>
        )}
      </div>
    </div>
  );
}
