import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant } from '../lib/types';
import 'leaflet/dist/leaflet.css';

const toiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZjc3ZjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBIOGEyIDIgMCAwIDAtMiAydjhhMiAyIDAgMCAwIDIgMmgxMyIvPjxwYXRoIGQ9Ik0xOCAxMFY2YTIgMiAwIDAgMC0yLTJIOGEyIDIgMCAwIDAtMiAydjQiLz48cGF0aCBkPSJNMTggMjBjMi0yIDItMy43NSAyLTVzLS43NS0yLjI1LTItMi4yNS0yIC43NS0yIDIuMjUuNzUgMyAyIDVaIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSI0IiByPSIyIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export default function Map({ restaurants, selectedRestaurant, onRestaurantClick }: MapProps) {
  const budapestCenter: [number, number] = [47.4979, 19.0402];

  return (
    <MapContainer
      center={budapestCenter}
      zoom={13}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={toiletIcon}
          eventHandlers={{
            click: () => onRestaurantClick(restaurant),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
              {restaurant.toilet_code && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Code:</span> {restaurant.toilet_code}
                </p>
              )}
              {restaurant.toilet_notes && (
                <p className="text-sm mt-1 text-gray-700">{restaurant.toilet_notes}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
