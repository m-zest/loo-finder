import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant, ToiletDirection, UserLocation } from '../lib/types';
import { formatDistance, getWalkingTime, getDirectionsUrl } from '../lib/geo';
import 'leaflet/dist/leaflet.css';

const workingToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M16 2C8.3 2 2 8.3 2 16c0 10 14 22 14 22s14-12 14-22C30 8.3 23.7 2 16 2z" fill="#10b981" filter="url(#s)"/>
      <circle cx="16" cy="15" r="7" fill="white"/>
      <text x="16" y="19" text-anchor="middle" font-size="12" fill="#10b981">W</text>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

const notWorkingToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M16 2C8.3 2 2 8.3 2 16c0 10 14 22 14 22s14-12 14-22C30 8.3 23.7 2 16 2z" fill="#ef4444" filter="url(#s)"/>
      <circle cx="16" cy="15" r="7" fill="white"/>
      <line x1="11" y1="11" x2="21" y2="19" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

const unknownToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M16 2C8.3 2 2 8.3 2 16c0 10 14 22 14 22s14-12 14-22C30 8.3 23.7 2 16 2z" fill="#3b82f6" filter="url(#s)"/>
      <circle cx="16" cy="15" r="7" fill="white"/>
      <text x="16" y="19" text-anchor="middle" font-size="12" font-weight="bold" fill="#3b82f6">?</text>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

const selectedToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <defs>
        <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M20 2C11 2 3 10 3 19c0 12 17 28 17 28s17-16 17-28C37 10 29 2 20 2z" fill="#6366f1" filter="url(#g)"/>
      <circle cx="20" cy="18" r="9" fill="white"/>
      <text x="20" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#6366f1">&#9733;</text>
    </svg>
  `),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#7c3aed" opacity="0.2"/>
      <circle cx="12" cy="12" r="6" fill="#7c3aed" opacity="0.4"/>
      <circle cx="12" cy="12" r="4" fill="#7c3aed" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const directionLabels: Record<NonNullable<ToiletDirection>, { label: string; icon: string }> = {
  left: { label: 'Turn Left', icon: '\u2190' },
  right: { label: 'Turn Right', icon: '\u2192' },
  straight: { label: 'Straight Ahead', icon: '\u2191' },
  upstairs: { label: 'Go Upstairs', icon: '\u2197' },
  downstairs: { label: 'Go Downstairs', icon: '\u2198' },
  basement: { label: 'In Basement', icon: '\u2B07' },
};

interface MapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantClick: (restaurant: Restaurant) => void;
  userLocation: UserLocation | null;
}

function MapController({ selectedRestaurant, userLocation }: { selectedRestaurant: Restaurant | null; userLocation: UserLocation | null }) {
  const map = useMap();
  const previousSelected = useRef<string | null>(null);
  const initialZoomDone = useRef(false);

  useEffect(() => {
    if (userLocation && !initialZoomDone.current) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 1 });
      initialZoomDone.current = true;
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.id !== previousSelected.current) {
      map.flyTo([selectedRestaurant.latitude, selectedRestaurant.longitude], 17, { duration: 0.5 });
      previousSelected.current = selectedRestaurant.id;
    }
  }, [selectedRestaurant, map]);

  return null;
}

export default function Map({ restaurants, selectedRestaurant, onRestaurantClick, userLocation }: MapProps) {
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [47.4979, 19.0402];

  const getIcon = (restaurant: Restaurant) => {
    if (selectedRestaurant?.id === restaurant.id) return selectedToiletIcon;
    if (restaurant.toilet_status === 'not_working') return notWorkingToiletIcon;
    if (restaurant.toilet_status === 'working') return workingToiletIcon;
    return unknownToiletIcon;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'not_working')
      return '<span style="display:inline-flex;padding:2px 8px;background:#fee2e2;color:#dc2626;font-size:11px;font-weight:600;border-radius:9999px;">Not Working</span>';
    if (status === 'working')
      return '<span style="display:inline-flex;padding:2px 8px;background:#dcfce7;color:#16a34a;font-size:11px;font-weight:600;border-radius:9999px;">Available</span>';
    return '<span style="display:inline-flex;padding:2px 8px;background:#fef3c7;color:#d97706;font-size:11px;font-weight:600;border-radius:9999px;">Unverified</span>';
  };

  return (
    <MapContainer
      center={center}
      zoom={userLocation ? 15 : 13}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <MapController selectedRestaurant={selectedRestaurant} userLocation={userLocation} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location */}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={100}
            pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.1, weight: 1 }}
          />
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
            <Popup>
              <div style={{ padding: '4px', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>You are here</p>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={getIcon(restaurant)}
          eventHandlers={{ click: () => onRestaurantClick(restaurant) }}
        >
          <Popup>
            <div style={{ minWidth: '220px', maxWidth: '280px', padding: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '15px', margin: 0, color: '#1f2937', flex: 1 }}>{restaurant.name}</h3>
                <div dangerouslySetInnerHTML={{ __html: getStatusBadge(restaurant.toilet_status || 'unknown') }} />
              </div>

              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0' }}>{restaurant.address}</p>

              {restaurant.distance !== undefined && (
                <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, margin: '0 0 6px 0' }}>
                  {formatDistance(restaurant.distance)} away &middot; {getWalkingTime(restaurant.distance)} walk
                </p>
              )}

              {restaurant.toilet_code && (
                <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', padding: '8px', borderRadius: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 500, display: 'block' }}>Access Code</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af', letterSpacing: '1px' }}>{restaurant.toilet_code}</span>
                </div>
              )}

              {restaurant.toilet_direction && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4b5563', marginBottom: '6px', background: '#f3f4f6', padding: '5px 8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{directionLabels[restaurant.toilet_direction].icon}</span>
                  <span>{directionLabels[restaurant.toilet_direction].label}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <a
                  href={userLocation
                    ? getDirectionsUrl(userLocation.latitude, userLocation.longitude, restaurant.latitude, restaurant.longitude)
                    : `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', background: '#16a34a', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                >
                  Walk There
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
