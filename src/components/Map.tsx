import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Restaurant, ToiletDirection } from '../lib/types';
import 'leaflet/dist/leaflet.css';

// Working toilet icon (green)
const workingToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0 L40 15 L40 40 Q40 48 32 48 L8 48 Q0 48 0 40 L0 15 Z" fill="#10b981" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="8" fill="white"/>
      <path d="M16 32 L24 32 L24 40 L16 40 Z" fill="white"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

// Not working toilet icon (red)
const notWorkingToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0 L40 15 L40 40 Q40 48 32 48 L8 48 Q0 48 0 40 L0 15 Z" fill="#ef4444" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="8" fill="white"/>
      <path d="M16 32 L24 32 L24 40 L16 40 Z" fill="white"/>
      <line x1="10" y1="10" x2="30" y2="38" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

// Unknown status toilet icon (blue)
const unknownToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0 L40 15 L40 40 Q40 48 32 48 L8 48 Q0 48 0 40 L0 15 Z" fill="#3b82f6" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="8" fill="white"/>
      <path d="M16 32 L24 32 L24 40 L16 40 Z" fill="white"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

// Selected toilet icon (larger, with glow)
const selectedToiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M24 0 L48 18 L48 46 Q48 56 38 56 L10 56 Q0 56 0 46 L0 18 Z" fill="#6366f1" filter="url(#glow)"/>
      <circle cx="24" cy="22" r="10" fill="white"/>
      <path d="M19 38 L29 38 L29 48 L19 48 Z" fill="white"/>
    </svg>
  `),
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  popupAnchor: [0, -56],
});

const directionLabels: Record<NonNullable<ToiletDirection>, { label: string; icon: string }> = {
  left: { label: 'Turn Left', icon: '←' },
  right: { label: 'Turn Right', icon: '→' },
  straight: { label: 'Straight Ahead', icon: '↑' },
  upstairs: { label: 'Go Upstairs', icon: '↗' },
  downstairs: { label: 'Go Downstairs', icon: '↘' },
  basement: { label: 'In Basement', icon: '⬇' },
};

interface MapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantClick: (restaurant: Restaurant) => void;
}

function MapController({ selectedRestaurant }: { selectedRestaurant: Restaurant | null }) {
  const map = useMap();
  const previousSelected = useRef<string | null>(null);

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.id !== previousSelected.current) {
      map.flyTo([selectedRestaurant.latitude, selectedRestaurant.longitude], 16, {
        duration: 0.5,
      });
      previousSelected.current = selectedRestaurant.id;
    }
  }, [selectedRestaurant, map]);

  return null;
}

export default function Map({ restaurants, selectedRestaurant, onRestaurantClick }: MapProps) {
  const budapestCenter: [number, number] = [47.4979, 19.0402];

  const getIcon = (restaurant: Restaurant) => {
    if (selectedRestaurant?.id === restaurant.id) return selectedToiletIcon;
    if (restaurant.toilet_status === 'not_working') return notWorkingToiletIcon;
    if (restaurant.toilet_status === 'working') return workingToiletIcon;
    return unknownToiletIcon;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'not_working') {
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:#fee2e2;color:#dc2626;font-size:11px;font-weight:600;border-radius:9999px;">Not Working</span>';
    }
    if (status === 'working') {
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:#dcfce7;color:#16a34a;font-size:11px;font-weight:600;border-radius:9999px;">Available</span>';
    }
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:#fef3c7;color:#d97706;font-size:11px;font-weight:600;border-radius:9999px;">Unverified</span>';
  };

  const getAmenityBadges = (restaurant: Restaurant) => {
    const badges = [];
    if (restaurant.amenities?.wheelchair_accessible) {
      badges.push('<span style="display:inline-flex;padding:2px 6px;background:#dbeafe;color:#2563eb;font-size:10px;border-radius:4px;" title="Wheelchair Accessible">♿</span>');
    }
    if (restaurant.amenities?.baby_changing) {
      badges.push('<span style="display:inline-flex;padding:2px 6px;background:#fce7f3;color:#db2777;font-size:10px;border-radius:4px;" title="Baby Changing">👶</span>');
    }
    if (restaurant.amenities?.free) {
      badges.push('<span style="display:inline-flex;padding:2px 6px;background:#dcfce7;color:#16a34a;font-size:10px;border-radius:4px;">Free</span>');
    }
    return badges.join(' ');
  };

  return (
    <MapContainer
      center={budapestCenter}
      zoom={13}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <MapController selectedRestaurant={selectedRestaurant} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={getIcon(restaurant)}
          eventHandlers={{
            click: () => onRestaurantClick(restaurant),
          }}
        >
          <Popup>
            <div style={{ minWidth: '220px', padding: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '16px', margin: 0, color: '#1f2937' }}>{restaurant.name}</h3>
                <div dangerouslySetInnerHTML={{ __html: getStatusBadge(restaurant.toilet_status || 'unknown') }} />
              </div>

              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>{restaurant.address}</p>

              {restaurant.toilet_code && (
                <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500', display: 'block' }}>Access Code</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e40af', letterSpacing: '1px' }}>{restaurant.toilet_code}</span>
                </div>
              )}

              {restaurant.toilet_direction && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', marginBottom: '8px', background: '#f3f4f6', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{directionLabels[restaurant.toilet_direction].icon}</span>
                  <span>{directionLabels[restaurant.toilet_direction].label}</span>
                </div>
              )}

              {restaurant.toilet_notes && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontStyle: 'italic' }}>
                  {restaurant.toilet_notes}
                </p>
              )}

              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: getAmenityBadges(restaurant) }} />

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', background: '#16a34a', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}
                >
                  Directions
                </a>
                <span
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', background: '#f3f4f6', color: '#374151', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'default' }}
                >
                  Use sidebar for feedback
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
