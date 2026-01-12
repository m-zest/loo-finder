import { useMemo } from 'react';
import type { Restaurant, FilterOptions } from '../lib/types';
import ToiletCard from './ToiletCard';
import SearchFilter from './SearchFilter';
import StatsBar from './StatsBar';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  onFeedback: (restaurant: Restaurant) => void;
  onSuggestUpdate: (restaurant: Restaurant) => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function RestaurantList({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
  onFeedback,
  onSuggestUpdate,
  filters,
  onFilterChange,
}: RestaurantListProps) {
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          restaurant.name.toLowerCase().includes(searchLower) ||
          restaurant.address.toLowerCase().includes(searchLower) ||
          (restaurant.toilet_notes && restaurant.toilet_notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Amenity filters
      if (filters.wheelchairAccessible && !restaurant.amenities?.wheelchair_accessible) return false;
      if (filters.babyChanging && !restaurant.amenities?.baby_changing) return false;
      if (filters.freeOnly && !restaurant.amenities?.free) return false;
      if (filters.genderNeutral && !restaurant.amenities?.gender_neutral) return false;

      // Status filters
      if (filters.workingOnly && restaurant.toilet_status === 'not_working') return false;
      if (filters.verifiedOnly && !restaurant.verified) return false;

      return true;
    });
  }, [restaurants, filters]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Stats Bar */}
      <StatsBar restaurants={restaurants} />

      {/* Search and Filter */}
      <SearchFilter
        filters={filters}
        onFilterChange={onFilterChange}
        resultCount={filteredRestaurants.length}
        totalCount={restaurants.length}
      />

      {/* Restaurant List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚽</span>
            </div>
            <p className="text-gray-600 font-medium">No toilets found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filters.search ? 'Try adjusting your search' : 'Try different filters'}
            </p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <ToiletCard
              key={restaurant.id}
              restaurant={restaurant}
              isSelected={selectedRestaurant?.id === restaurant.id}
              onSelect={() => onRestaurantSelect(restaurant)}
              onFeedback={() => onFeedback(restaurant)}
              onUpdate={() => onSuggestUpdate(restaurant)}
            />
          ))
        )}
      </div>
    </div>
  );
}
