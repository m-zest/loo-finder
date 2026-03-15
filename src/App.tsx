import { useEffect, useState, useCallback } from 'react';
import { Plus, Navigation2, Loader2 } from 'lucide-react';
import Map from './components/Map';
import RestaurantList from './components/RestaurantList';
import ContributionModal from './components/ContributionModal';
import FeedbackModal from './components/FeedbackModal';
import Header from './components/Header';
import AboutModal from './components/AboutModal';
import { supabase } from './lib/supabase';
import { requestUserLocation, sortByDistance } from './lib/geo';
import type { Restaurant, FilterOptions, UserLocation } from './lib/types';

const defaultFilters: FilterOptions = {
  search: '',
  wheelchairAccessible: false,
  babyChanging: false,
  freeOnly: false,
  genderNeutral: false,
  workingOnly: false,
  verifiedOnly: false,
  nearbyOnly: false,
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  const fetchRestaurants = useCallback(async (loc?: UserLocation | null) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('has_toilet', true)
        .order('name');

      if (error) throw error;

      let normalizedData = (data || []).map((restaurant: Restaurant) => ({
        ...restaurant,
        toilet_direction: restaurant.toilet_direction || null,
        toilet_status: restaurant.toilet_status || 'unknown',
        rating: restaurant.rating || null,
        rating_count: restaurant.rating_count || 0,
        amenities: restaurant.amenities || null,
        verified: restaurant.verified || false,
        last_verified: restaurant.last_verified || null,
        upvotes: restaurant.upvotes || 0,
        downvotes: restaurant.downvotes || 0,
      })) as Restaurant[];

      const location = loc !== undefined ? loc : userLocation;
      if (location) {
        normalizedData = sortByDistance(normalizedData, location);
      }

      setRestaurants(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    handleRequestLocation();
  }, []);

  const handleRequestLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await requestUserLocation();
      setUserLocation(loc);
      await fetchRestaurants(loc);
    } catch {
      // User denied or geolocation unavailable, load without distance
      await fetchRestaurants(null);
    } finally {
      setLocationLoading(false);
    }
  };

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

  const handleVote = async (restaurantId: string, voteType: 'confirm' | 'deny', comment?: string) => {
    try {
      await supabase.from('votes').insert([{
        restaurant_id: restaurantId,
        vote_type: voteType,
        comment: comment || null,
      }] as never);

      // Update local count
      setRestaurants(prev => prev.map(r => {
        if (r.id === restaurantId) {
          return {
            ...r,
            upvotes: voteType === 'confirm' ? r.upvotes + 1 : r.upvotes,
            downvotes: voteType === 'deny' ? r.downvotes + 1 : r.downvotes,
          };
        }
        return r;
      }));
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-100">
      <Header onAboutClick={() => setAboutModalOpen(true)} />

      {/* Mobile Toggle */}
      <div className="md:hidden flex bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            mobileView === 'map'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500'
          }`}
        >
          Map View
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            mobileView === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500'
          }`}
        >
          List View ({restaurants.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Hidden on mobile map view */}
        <div className={`w-full md:w-[420px] md:h-full overflow-hidden border-b md:border-r border-gray-200 bg-white shadow-lg ${
          mobileView === 'list' ? 'flex-1' : 'hidden md:block'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">
                  {locationLoading ? 'Getting your location...' : 'Finding toilets nearby...'}
                </p>
                <p className="mt-1 text-gray-400 text-sm">Loading Budapest locations</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6 bg-gray-50">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">&#128533;</span>
                </div>
                <p className="font-semibold text-gray-900">Unable to load data</p>
                <p className="text-sm mt-2 text-gray-500">{error}</p>
                <button
                  onClick={() => fetchRestaurants()}
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
              onRestaurantSelect={(r) => {
                setSelectedRestaurant(r);
                setMobileView('map');
              }}
              onFeedback={handleFeedback}
              onSuggestUpdate={handleSuggestUpdate}
              onVote={handleVote}
              filters={filters}
              onFilterChange={setFilters}
              userLocation={userLocation}
            />
          )}
        </div>

        {/* Map - Hidden on mobile list view */}
        <div className={`flex-1 md:h-full relative ${
          mobileView === 'map' ? 'flex-1' : 'hidden md:block'
        }`}>
          {!loading && !error && (
            <Map
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onRestaurantClick={(r) => setSelectedRestaurant(r)}
              userLocation={userLocation}
            />
          )}

          {/* Floating Buttons */}
          <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-40">
            {!userLocation && (
              <button
                onClick={handleRequestLocation}
                disabled={locationLoading}
                className="bg-white hover:bg-gray-50 text-gray-700 rounded-2xl p-3.5 shadow-lg transition-all hover:shadow-xl border border-gray-200"
                title="Find my location"
              >
                {locationLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation2 className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-5 py-4 shadow-lg transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2 font-semibold"
              title="Add a new toilet location"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Location</span>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-40 hidden md:block">
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
              {userLocation && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-purple-500 ring-2 ring-purple-200"></span>
                  You
                </div>
              )}
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
