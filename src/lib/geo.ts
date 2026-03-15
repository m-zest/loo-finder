import type { UserLocation, Restaurant } from './types';

// Haversine formula to calculate distance between two points in km
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)}m`;
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function getWalkingTime(km: number): string {
  const minutes = Math.round(km / 0.08); // ~5km/h walking speed = 0.083km/min
  if (minutes < 1) return '<1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

export function sortByDistance(restaurants: Restaurant[], userLocation: UserLocation): Restaurant[] {
  return restaurants
    .map(r => ({
      ...r,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

export function getDirectionsUrl(userLat: number, userLng: number, destLat: number, destLng: number): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=walking`;
}

export function requestUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
