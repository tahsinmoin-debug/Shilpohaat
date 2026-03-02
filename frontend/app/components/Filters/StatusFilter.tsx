'use client';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  selected: string;
  onChange: (status: string) => void;
}

export default function StatusFilter({
  options,
  selected,
  onChange,
}: StatusFilterProps) {
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm font-semibold block">
        Status
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((status) => (
          <button
            key={status.value}
            onClick={() => onChange(status.value)}
            aria-label={`Filter by ${status.label} status`}
            aria-pressed={selected === status.value}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 min-h-[44px] md:min-h-0 md:py-1.5 ${
              selected === status.value
                ? 'bg-brand-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {status.value !== 'all' && (
              <span
                className={`w-2 h-2 rounded-full ${
                  status.color === 'green'
                    ? 'bg-green-500'
                    : status.color === 'red'
                    ? 'bg-red-500'
                    : status.color === 'yellow'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              ></span>
            )}
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
