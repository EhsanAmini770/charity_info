import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi, LocationItem } from '@/services/api';

// Extend Window interface to include Leaflet
declare global {
  interface Window {
    L: any;
    google?: any;
  }

  // Extend HTMLDivElement to include Leaflet properties
  interface HTMLDivElement {
    _leaflet_id?: number;
    mapInstance?: any;
    markers?: Record<string, any>;
  }
}

interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  email?: string;
  isMainOffice?: boolean;
}

interface InteractiveMapProps {
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Fetch locations from API
  const { data: locationsData, isLoading: isLoadingLocations, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll({ active: true }),
  });

  // Convert API locations to the format needed by the map
  const locations: Location[] = React.useMemo(() => {
    if (!locationsData?.locations) return [];

    return locationsData.locations.map((loc: LocationItem) => ({
      id: loc._id,
      name: loc.name,
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address,
      phone: loc.phone,
      email: loc.email,
      isMainOffice: loc.isMainOffice
    }));
  }, [locationsData]);

  // Set error if API request fails
  useEffect(() => {
    if (locationsError) {
      setError('Failed to load locations. Please try again later.');
    }
  }, [locationsError]);

  // Create a ref to store map and markers
  const mapInstanceRef = useRef<{
    map: any;
    markers: Record<string, any>;
    isInitialized: boolean;
  }>({ map: null, markers: {}, isInitialized: false });

  // Function to handle location selection
  const handleLocationSelect = (location: Location | null) => {
    if (!location) return;

    setSelectedLocation(location);

    // If map is initialized, pan to location and open popup
    if (mapInstanceRef.current.isInitialized) {
      const { map, markers } = mapInstanceRef.current;

      // Pan to marker location
      map.panTo([location.latitude, location.longitude]);

      // Open popup for this marker
      if (markers[location.id]) {
        markers[location.id].openPopup();
      }
    }
  };

  useEffect(() => {
    // Load map library
    const loadMapLibrary = () => {
      setIsLoading(true);

      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap();
        return;
      }

      // Use a free map alternative that doesn't require API key
      const mapScript = document.createElement('script');
      mapScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      mapScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      mapScript.crossOrigin = '';

      // Add leaflet CSS
      if (!document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
      }

      // Handle script load success
      mapScript.addEventListener('load', () => {
        initializeMap();
      });

      // Handle script load error
      mapScript.addEventListener('error', () => {
        setError('Failed to load map. Please try again later.');
        setIsLoading(false);
      });

      // Append script to document
      document.head.appendChild(mapScript);

      // Cleanup function
      return () => {
        document.head.removeChild(mapScript);
      };
    };

    // Initialize map after API is loaded
    const initializeMap = () => {
      if (!mapRef.current || !window.L) return;

      // Check if map is already initialized on this container
      if (mapRef.current._leaflet_id) {
        return; // Map already initialized
      }

      // If still loading locations, wait
      if (isLoadingLocations) {
        return;
      }

      // Find main office or use first location or default to Samsun coordinates
      const mainOffice = locations.find(loc => loc.isMainOffice) || locations[0];
      const defaultCenter = [41.2867, 36.3300]; // Default to Samsun, Turkey
      const mapCenter = mainOffice
        ? [mainOffice.latitude, mainOffice.longitude]
        : defaultCenter;

      // Create map centered on the main office
      const map = window.L.map(mapRef.current, {
        center: mapCenter,
        zoom: 12, // Closer zoom to show districts
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer (OpenStreetMap)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const customIcon = window.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });

      // Add markers for each location
      const markers: Record<string, any> = {};

      // Only add markers if we have locations
      if (locations.length > 0) {
        locations.forEach((location) => {
          const marker = window.L.marker(
            [location.latitude, location.longitude],
            { icon: customIcon, title: location.name }
          ).addTo(map);

          // Add popup to marker
          marker.bindPopup(`
            <div style="padding: 4px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-weight: bold; color: #0ea5e9;">${location.name}</h3>
              <p style="margin: 0; font-size: 14px;">${location.description}</p>
            </div>
          `);

          // Add click event to marker
          marker.on('click', () => {
            handleLocationSelect(location);
          });

          // Store marker reference
          markers[location.id] = marker;
        });
      }

      // Store map and markers in ref for access outside this function
      mapInstanceRef.current = {
        map,
        markers,
        isInitialized: true
      };

      // Select first location by default if available
      if (locations.length > 0) {
        handleLocationSelect(locations[0]);
      }

      setIsLoading(false);
    };

    loadMapLibrary();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current.isInitialized && mapRef.current) {
        // Clean up map instance if it exists
        if (mapRef.current._leaflet_id) {
          mapInstanceRef.current.map.remove();
          mapInstanceRef.current.isInitialized = false;
        }
      }
    };
  }, [locations, isLoadingLocations]);

  if (error) {
    return (
      <div className={`bg-red-50 p-4 rounded-lg text-center ${className}`}>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-teal-800">Where We Work</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Our organization operates in multiple locations across Samsun, Turkey, providing support and services to communities in need.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden shadow-md h-[400px] bg-gray-100">
              {(isLoading || isLoadingLocations) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                  <Loader className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              )}
              <div ref={mapRef} className="w-full h-full" />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h3 className="text-xl font-bold mb-4 text-teal-700">Our Samsun Locations</h3>

              <div className="space-y-4">
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedLocation?.id === location.id
                          ? 'bg-teal-50 border border-teal-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => location && handleLocationSelect(location)}
                    >
                      <div className="flex items-start">
                        <MapPin className={`h-5 w-5 mt-0.5 mr-2 ${
                          selectedLocation?.id === location.id ? 'text-teal-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{location.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                          {location.address && (
                            <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {isLoadingLocations ? 'Loading locations...' : 'No locations available.'}
                  </div>
                )}
              </div>

              {selectedLocation && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Location</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h5 className="font-medium text-teal-700">{selectedLocation.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{selectedLocation.description}</p>

                    {selectedLocation.address && (
                      <div className="mt-3 text-sm">
                        <div className="font-medium text-gray-700">Address:</div>
                        <p className="text-gray-600">{selectedLocation.address}</p>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {selectedLocation.phone && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">Phone:</div>
                          <p className="text-gray-600">{selectedLocation.phone}</p>
                        </div>
                      )}

                      {selectedLocation.email && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-700">Email:</div>
                          <p className="text-gray-600">{selectedLocation.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Want to visit our offices in Samsun? Click on a location to see details or contact us for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
