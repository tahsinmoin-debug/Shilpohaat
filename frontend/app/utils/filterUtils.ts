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

export interface FilterState {
  searchQuery: string;
  sortBy: 'newest' | 'popular' | 'price-low' | 'price-high';
  category: string;
  priceRange: { min: string; max: string };
  materials: string[];
  status: 'all' | 'available' | 'sold' | 'reserved';
  dimensions: {
    width: { min: string; max: string };
    height: { min: string; max: string };
  };
}

/**
 * Apply all filters to the artwork array
 * @param artworks - Array of artworks to filter
 * @param filters - Filter state object
 * @returns Filtered and sorted array of artworks
 */
export function applyFilters(
  artworks: Artwork[],
  filters: FilterState
): Artwork[] {
  let filtered = [...artworks];

  // Category filter
  if (filters.category !== 'All') {
    filtered = filtered.filter((art) => art.category === filters.category);
  }

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (art) =>
        art.title.toLowerCase().includes(query) ||
        art.artist?.name.toLowerCase().includes(query)
    );
  }

  // Price range filter
  if (filters.priceRange.min) {
    filtered = filtered.filter((art) => art.price >= Number(filters.priceRange.min));
  }
  if (filters.priceRange.max) {
    filtered = filtered.filter((art) => art.price <= Number(filters.priceRange.max));
  }

  // Material filter
  if (filters.materials.length > 0) {
    filtered = filtered.filter((art) =>
      art.material && filters.materials.includes(art.material)
    );
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter((art) => art.status === filters.status);
  }

  // Dimension filters
  if (filters.dimensions.width.min) {
    filtered = filtered.filter((art) =>
      art.dimensions && art.dimensions.width >= Number(filters.dimensions.width.min)
    );
  }
  if (filters.dimensions.width.max) {
    filtered = filtered.filter((art) =>
      art.dimensions && art.dimensions.width <= Number(filters.dimensions.width.max)
    );
  }
  if (filters.dimensions.height.min) {
    filtered = filtered.filter((art) =>
      art.dimensions && art.dimensions.height >= Number(filters.dimensions.height.min)
    );
  }
  if (filters.dimensions.height.max) {
    filtered = filtered.filter((art) =>
      art.dimensions && art.dimensions.height <= Number(filters.dimensions.height.max)
    );
  }

  // Sort
  switch (filters.sortBy) {
    case 'newest':
      // Keep original order (newest first)
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return filtered;
}

/**
 * Calculate the number of active advanced filters
 * @param filters - Filter state object
 * @returns Count of active advanced filters
 */
export function calculateActiveFilters(filters: FilterState): number {
  let count = 0;

  // Category
  if (filters.category !== 'All') count++;

  // Price range
  if (filters.priceRange.min || filters.priceRange.max) count++;

  // Materials
  if (filters.materials.length > 0) count++;

  // Status
  if (filters.status !== 'all') count++;

  // Dimensions
  if (
    filters.dimensions.width.min ||
    filters.dimensions.width.max ||
    filters.dimensions.height.min ||
    filters.dimensions.height.max
  ) {
    count++;
  }

  return count;
}

/**
 * Get default filter state
 * @returns Default FilterState object
 */
export function getDefaultFilters(): FilterState {
  return {
    searchQuery: '',
    sortBy: 'newest',
    category: 'All',
    priceRange: { min: '', max: '' },
    materials: [],
    status: 'all',
    dimensions: {
      width: { min: '', max: '' },
      height: { min: '', max: '' },
    },
  };
}
