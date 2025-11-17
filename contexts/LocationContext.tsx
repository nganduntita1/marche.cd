import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentLocation, findNearestCity, LocationCoords } from '@/services/locationService';

interface LocationContextType {
  userLocation: LocationCoords | null;
  currentCity: string | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
  setManualLocation: (city: string, coords: LocationCoords) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [currentCity, setCurrentCity] = useState<string | null>('Kinshasa'); // Default
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to get location on mount, but don't block
    refreshLocation();
  }, []);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        setUserLocation(coords);
        const city = findNearestCity(coords.latitude, coords.longitude);
        setCurrentCity(city);
      }
    } catch (error) {
      console.log('Could not get location:', error);
      // Keep default city
    } finally {
      setLoading(false);
    }
  };

  const setManualLocation = (city: string, coords: LocationCoords) => {
    setCurrentCity(city);
    setUserLocation(coords);
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        currentCity,
        loading,
        refreshLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
