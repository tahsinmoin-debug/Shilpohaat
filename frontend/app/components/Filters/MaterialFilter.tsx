'use client';

interface MaterialFilterProps {
  materials: string[];
  selected: string[];
  onToggle: (material: string) => void;
}

export default function MaterialFilter({
  materials,
  selected,
  onToggle,
}: MaterialFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm font-semibold block">
        Materials
      </label>
      <div className="flex flex-wrap gap-2">
        {materials.map((material) => (
          <button
            key={material}
            onClick={() => onToggle(material)}
            aria-label={`Filter by ${material} material`}
            aria-pressed={selected.includes(material)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] md:min-h-0 md:py-1.5 ${
              selected.includes(material)
                ? 'bg-brand-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {material}
          </button>
        ))}
      </div>
    </div>
  );
}
