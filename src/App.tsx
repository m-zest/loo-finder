import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Map from './components/Map';
import RestaurantList from './components/RestaurantList';
import ContributionModal from './components/ContributionModal';
import FeedbackModal from './components/FeedbackModal';
import Header from './components/Header';
import AboutModal from './components/AboutModal';
import { supabase } from './lib/supabase';
import type { Restaurant, FilterOptions } from './lib/types';

const defaultFilters: FilterOptions = {
  search: '',
  wheelchairAccessible: false,
  babyChanging: false,
  freeOnly: false,
  genderNeutral: false,
  workingOnly: false,
  verifiedOnly: false,
};

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'new_location' | 'update_suggestion'>('new_location');
  const [feedbackRestaurant, setFeedbackRestaurant] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

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

      // Ensure all restaurants have default values for new fields
      const normalizedData = (data || []).map((restaurant: Restaurant) => ({
        ...restaurant,
        toilet_direction: restaurant.toilet_direction || null,
        toilet_status: restaurant.toilet_status || 'unknown',
        rating: restaurant.rating || null,
        rating_count: restaurant.rating_count || 0,
        amenities: restaurant.amenities || null,
        verified: restaurant.verified || false,
        last_verified: restaurant.last_verified || null,
      })) as Restaurant[];

      setRestaurants(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFeedback = (restaurant: Restaurant) => {
    setFeedbackRestaurant(restaurant);
    setFeedbackModalOpen(true);
  };

  const handleSuggestUpdate = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType('update_suggestion');
    setContributionModalOpen(true);
  };

  const handleAddNew = () => {
    setModalType('new_location');
    setSelectedRestaurant(null);
    setContributionModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header onAboutClick={() => setAboutModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[420px] h-[45vh] md:h-full overflow-hidden border-b md:border-r border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">Finding toilets nearby...</p>
                <p className="mt-1 text-gray-400 text-sm">Loading Budapest locations</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6 bg-gray-50">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😕</span>
                </div>
                <p className="font-semibold text-gray-900">Unable to load data</p>
                <p className="text-sm mt-2 text-gray-500">{error}</p>
                <button
                  onClick={fetchRestaurants}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <RestaurantList
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onRestaurantSelect={setSelectedRestaurant}
              onFeedback={handleFeedback}
              onSuggestUpdate={handleSuggestUpdate}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}
        </div>

        {/* Map */}
        <div className="flex-1 h-[55vh] md:h-full relative">
          {!loading && !error && (
            <Map
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onRestaurantClick={setSelectedRestaurant}
            />
          )}

          {/* Floating Add Button */}
          <button
            onClick={handleAddNew}
            className="absolute bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-5 py-4 shadow-lg transition-all hover:shadow-xl hover:scale-105 z-40 flex items-center gap-2 font-semibold"
            title="Add a new toilet location"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Location</span>
          </button>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-40 hidden md:block">
            <p className="text-xs font-semibold text-gray-700 mb-2">Map Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Working
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Unverified
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Not Working
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContributionModal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        type={modalType}
        restaurant={selectedRestaurant || undefined}
        onSuccess={() => {
          setSelectedRestaurant(null);
          fetchRestaurants();
        }}
      />

      {feedbackRestaurant && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setFeedbackRestaurant(null);
          }}
          restaurant={feedbackRestaurant}
          onSuccess={() => {
            fetchRestaurants();
          }}
        />
      )}

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
}

export default App;
