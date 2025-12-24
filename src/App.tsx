import { useEffect, useState } from 'react';
import Map from './components/Map';
import RestaurantList from './components/RestaurantList';
import { supabase } from './lib/supabase';
import type { Restaurant } from './lib/types';

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('has_toilet', true)
        .order('name');

      if (error) throw error;

      setRestaurants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-96 h-1/3 md:h-full overflow-hidden border-b md:border-r border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading restaurants...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </div>
        ) : (
          <RestaurantList
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onRestaurantSelect={setSelectedRestaurant}
          />
        )}
      </div>

      <div className="flex-1 h-2/3 md:h-full relative">
        {!loading && !error && (
          <Map
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onRestaurantClick={setSelectedRestaurant}
          />
        )}
      </div>
    </div>
  );
}

export default App;
