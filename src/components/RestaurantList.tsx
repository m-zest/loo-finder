import { MapPin, Clock, Phone, Key, Info } from 'lucide-react';
import type { Restaurant } from '../lib/types';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantSelect: (restaurant: Restaurant) => void;
}

export default function RestaurantList({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
}: RestaurantListProps) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
        <h1 className="text-2xl font-bold">Budapest Toilets</h1>
        <p className="text-sm mt-1 text-blue-100">
          Find free public toilets at restaurants
        </p>
      </div>

      <div className="p-4 space-y-3">
        {restaurants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No restaurants found</p>
            <p className="text-sm mt-2">Check back later for updates</p>
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => onRestaurantSelect(restaurant)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedRestaurant?.id === restaurant.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-semibold text-lg text-gray-900">
                {restaurant.name}
              </h3>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{restaurant.address}</span>
                </div>

                {restaurant.opening_hours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                )}

                {restaurant.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.toilet_code && (
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="w-4 h-4 flex-shrink-0 text-blue-600" />
                    <span className="font-medium text-blue-600">
                      Code: {restaurant.toilet_code}
                    </span>
                  </div>
                )}

                {restaurant.toilet_notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-700 bg-yellow-50 p-2 rounded mt-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                    <span>{restaurant.toilet_notes}</span>
                  </div>
                )}
              </div>

              {restaurant.has_toilet && (
                <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Free Toilet Available
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
