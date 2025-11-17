import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoords {
  city?: string;
  country?: string;
}

// Major cities in Congo (RDC) with approximate coordinates
export const CONGO_CITIES = [
  { name: 'Kinshasa', latitude: -4.3217, longitude: 15.3125 },
  { name: 'Lubumbashi', latitude: -11.6667, longitude: 27.4667 },
  { name: 'Kipushi', latitude: -11.7608, longitude: 27.2514 },
  { name: 'Mbuji-Mayi', latitude: -6.1500, longitude: 23.6000 },
  { name: 'Kananga', latitude: -5.8833, longitude: 22.4167 },
  { name: 'Kisangani', latitude: 0.5167, longitude: 25.2000 },
  { name: 'Bukavu', latitude: -2.5083, longitude: 28.8608 },
  { name: 'Goma', latitude: -1.6792, longitude: 29.2228 },
  { name: 'Likasi', latitude: -10.9833, longitude: 26.7333 },
  { name: 'Kolwezi', latitude: -10.7167, longitude: 25.4667 },
  { name: 'Tshikapa', latitude: -6.4167, longitude: 20.8000 },
  { name: 'Kikwit', latitude: -5.0333, longitude: 18.8167 },
  { name: 'Mbandaka', latitude: 0.0333, longitude: 18.2667 },
  { name: 'Matadi', latitude: -5.8167, longitude: 13.4500 },
  { name: 'Uvira', latitude: -3.3833, longitude: 29.1333 },
  { name: 'Butembo', latitude: 0.1417, longitude: 29.2917 },
];

/**
 * Request location permissions from the user
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Check if location permissions are granted
 */
export async function hasLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Get the user's current location
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}

/**
 * Get city name from coordinates (reverse geocoding)
 */
export async function getCityFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results && results.length > 0) {
      const result = results[0];
      return result.city || result.subregion || result.region || null;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Get coordinates from city name (geocoding)
 */
export async function getCoordinatesFromCity(
  cityName: string
): Promise<LocationCoords | null> {
  try {
    // First check if it's a known Congo city
    const knownCity = CONGO_CITIES.find(
      (city) => city.name.toLowerCase() === cityName.toLowerCase()
    );
    
    if (knownCity) {
      return {
        latitude: knownCity.latitude,
        longitude: knownCity.longitude,
      };
    }

    // Otherwise try geocoding
    const results = await Location.geocodeAsync(`${cityName}, Congo`);
    
    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

/**
 * Find nearest city from coordinates
 */
export function findNearestCity(
  latitude: number,
  longitude: number
): string {
  let nearestCity = CONGO_CITIES[0];
  let minDistance = calculateDistance(
    latitude,
    longitude,
    nearestCity.latitude,
    nearestCity.longitude
  );

  for (const city of CONGO_CITIES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      city.latitude,
      city.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity.name;
}

/**
 * Check if a location is nearby (within specified km)
 */
export function isNearby(
  userLat: number,
  userLon: number,
  itemLat: number,
  itemLon: number,
  radiusKm: number = 5
): boolean {
  const distance = calculateDistance(userLat, userLon, itemLat, itemLon);
  return distance <= radiusKm;
}
