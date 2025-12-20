'use client';

interface ARBadgeProps {
  hasARModel: boolean;
  compact?: boolean;
}

export default function ARBadge({ hasARModel, compact = false }: ARBadgeProps) {
  if (!hasARModel) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        AR
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <span>AR Preview Available</span>
    </div>
  );
}
