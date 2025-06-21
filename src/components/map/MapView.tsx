'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface Company {
  id: string;
  name: string;
  location?: string;
  website?: string;
  employees?: number;
  industry?: string;
  confidenceScore?: number;
  [key: string]: any; // Allow additional properties
}

// Type for popup info
interface PopupInfo {
  company: Company;
  longitude: number;
  latitude: number;
}

export interface MapViewProps {
  companies: Company[];
  onViewStateChange?: (viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  style?: React.CSSProperties;
  mapboxAccessToken?: string;
  className?: string;
}

export function MapView({
  companies = [],
  onViewStateChange,
  initialViewState = {
    longitude: 8.2275, // Center of Switzerland
    latitude: 46.8182,
    zoom: 7,
  },
  style = { width: '100%', height: '100%' },
  mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  className = '',
}: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const containerClassName = `h-full w-full ${className}`.trim();

  const handleViewStateChange = useCallback((evt: any) => {
    const newViewState = {
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
      zoom: evt.viewState.zoom,
    };
    onViewStateChange?.(newViewState);
  }, [onViewStateChange]);

  if (!mapboxAccessToken) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <p className="text-red-500">Mapbox access token is not configured</p>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Map
        initialViewState={initialViewState}
        onMove={handleViewStateChange}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={mapboxAccessToken}
        style={style}
        reuseMaps
      >
        {companies.map((company) => {
          // Generate random coordinates within Switzerland for demo purposes

          return (
            <Marker
              key={`marker-${company.id}`}
              longitude={company.longitude}
              latitude={company.latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo({ company, longitude: company.longitude, latitude: company.latitude });
              }}
            >
              <div className="cursor-pointer rounded-full bg-blue-500 p-2 text-white shadow-lg transition-transform hover:scale-110">
                <MapPin className="h-5 w-5" />
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="space-y-1 p-2">
              <h3 className="font-semibold">{popupInfo.company.name}</h3>
              {popupInfo.company.location && (
                <p className="text-sm text-gray-600">{popupInfo.company.location}</p>
              )}
              {popupInfo.company.employees && (
                <p className="text-sm text-gray-600">
                  {popupInfo.company.employees.toLocaleString()} employees
                </p>
              )}
              {popupInfo.company.website && (
                <a
                  href={`https://${popupInfo.company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {popupInfo.company.website}
                </a>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

// Simple MapPin component since we can't import icons directly in this component
function MapPin({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
