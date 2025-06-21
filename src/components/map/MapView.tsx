'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
  Layer,
  Source
} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Plus, Minus, ExternalLink, LocateFixed } from 'lucide-react';
import Supercluster from 'supercluster';
import type { Feature, Point } from 'geojson';

// @ts-expect-error: workaround for MapLibre v3+ compatibility
maplibregl.supported = () => true;

export interface Company {
  id: string;
  name: string;
  location?: string;
  website?: string;
  logo?: string;
  employees?: number;
  industry?: string;
  confidenceScore?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

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
  className?: string;
}

// Map theme configuration
const MAP_THEMES = [
  {
    id: 'positron',
    label: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  },
  {
    id: 'dark-matter',
    label: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  {
    id: 'streets',
    label: 'Streets',
    url: 'https://demotiles.maplibre.org/style.json'
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  }
];

// Custom GeoJSON data layer
const exampleGeoJson = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: { 
        type: 'Point' as const, 
        coordinates: [8.54, 47.37] 
      },
      properties: { 
        name: 'Zurich', 
        value: 100,
        description: 'Financial hub of Switzerland'
      },
    },
    {
      type: 'Feature' as const,
      geometry: { 
        type: 'Point' as const, 
        coordinates: [6.63, 46.52] 
      },
      properties: { 
        name: 'Lausanne', 
        value: 80,
        description: 'Home to Olympic Museum'
      },
    },
  ],
};

export function MapView({
  companies = [],
  onViewStateChange,
  initialViewState = {
    longitude: 8.2275,
    latitude: 46.8182,
    zoom: 7,
  },
  style = { width: '100%', height: '100%' },
  className = '',
}: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [geoJsonPopup, setGeoJsonPopup] = useState<any>(null);
  const [mapTheme, setMapTheme] = useState(MAP_THEMES[0]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [zoom, setZoom] = useState(initialViewState.zoom);
  const containerClassName = `h-full w-full ${className}`.trim();
  const mapRef = useRef<any>(null);
  const superclusterRef = useRef<Supercluster | null>(null);

  // Initialize clustering
  useEffect(() => {
    if (!companies.length) return;
    
    superclusterRef.current = new Supercluster({
      radius: 40,
      maxZoom: 16,
    });

    // Prepare GeoJSON features
    const points: Feature<Point, Company>[] = companies
      .filter(company => 
        typeof company.longitude === 'number' && 
        typeof company.latitude === 'number' &&
        !isNaN(company.longitude!) &&
        !isNaN(company.latitude!)
      )
      .map(company => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [company.longitude!, company.latitude!],
        },
        properties: company,
      }));

    superclusterRef.current.load(points);
    updateClusters();
  }, [companies]);

  const updateClusters = useCallback(() => {
    if (!superclusterRef.current || !mapRef.current) return;
    
    const bounds = mapRef.current.getMap().getBounds().toArray().flat();
    const newClusters = superclusterRef.current.getClusters(bounds, Math.floor(zoom));
    setClusters(newClusters);
  }, [zoom]);

  const handleViewStateChange = useCallback((evt: any) => {
    const newViewState = {
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
      zoom: evt.viewState.zoom,
    };
    setZoom(evt.viewState.zoom);
    onViewStateChange?.(newViewState);
    updateClusters();
  }, [onViewStateChange, updateClusters]);

  const handleMapLoad = (e: any) => {
    const map = e.target;
    
    // Add custom data layer
    if (!map.getSource('example-geojson')) {
      map.addSource('example-geojson', { 
        type: 'geojson', 
        data: exampleGeoJson 
      });
      
      map.addLayer({
        id: 'example-circles',
        type: 'circle',
        source: 'example-geojson',
        paint: {
          'circle-color': '#f59e42',
          'circle-radius': 10,
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // Add 3D terrain (if supported)
    try {
      map.addSource('terrain-source', {
        type: 'raster-dem',
        url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
        tileSize: 256,
      });
      
      map.setTerrain({
        source: 'terrain-source',
        exaggeration: 1.5,
      });
      
      // Add sky layer for realistic atmosphere
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });
    } catch (error) {
      console.warn('3D terrain not supported in this environment');
    }
  };

  const handleClusterClick = (cluster: any, lngLat: [number, number]) => {
    const expansionZoom = Math.min(
      superclusterRef.current!.getClusterExpansionZoom(cluster.id),
      18
    );
    
    mapRef.current?.flyTo({
      center: lngLat,
      zoom: expansionZoom,
      duration: 500,
    });
  };

  // Convert companies to GeoJSON for heatmap
  const companiesGeoJson = {
    type: 'FeatureCollection' as const,
    features: companies
      .filter(c => typeof c.longitude === 'number' && typeof c.latitude === 'number' && !isNaN(c.longitude!) && !isNaN(c.latitude!))
      .map(c => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [c.longitude!, c.latitude!] },
        properties: c,
      })),
  };

  return (
    <div className={containerClassName} style={{ position: 'relative' }}>
      {/* Theme Selector */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded shadow-md">
        <select
          value={mapTheme.id}
          onChange={(e) => 
            setMapTheme(MAP_THEMES.find(t => t.id === e.target.value)!)
          }
          className="p-2 rounded border border-gray-300 text-sm"
        >
          {MAP_THEMES.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* Geolocate Button */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          className="bg-white p-2 rounded shadow hover:bg-gray-100 border border-gray-200"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          className="bg-white p-2 rounded shadow hover:bg-gray-100 border border-gray-200"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={() => mapRef.current?.flyTo({
            center: [initialViewState.longitude, initialViewState.latitude],
            zoom: initialViewState.zoom,
            duration: 800
          })}
          className="bg-white p-2 rounded shadow hover:bg-gray-100 border border-gray-200"
          aria-label="Reset view"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={initialViewState}
        onMove={handleViewStateChange}
        mapStyle={mapTheme.url}
        style={style}
        reuseMaps
        onLoad={handleMapLoad}
        interactiveLayerIds={['example-circles']}
        onClick={(e) => {
          // Handle custom layer clicks
          if (e.features?.length) {
            const feature = e.features[0];
            if (feature.source === 'example-geojson') {
              setGeoJsonPopup({
                feature,
                lngLat: e.lngLat
              });
            }
          } else {
            setGeoJsonPopup(null);
          }
        }}
        terrain={{ source: 'terrain-source', exaggeration: 1.5 }}
      >
        {/* Built-in Controls (except NavigationControl) */}

        <FullscreenControl position="bottom-right" />
        <ScaleControl position="bottom-left" />

        {/* Custom GeoJSON Layer */}
        <Source id="example-geojson" type="geojson" data={exampleGeoJson}>
          <Layer
            id="example-circles"
            type="circle"
            paint={{
              'circle-color': '#f59e42',
              'circle-radius': 10,
              'circle-opacity': 0.8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* Heatmap Layer Example (now uses companies data) */}
        <Source id="heatmap-data" type="geojson" data={companiesGeoJson}>
          <Layer
            id="heatmap-layer"
            type="heatmap"
            paint={{
              'heatmap-weight': 1,
              'heatmap-intensity': 1,
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
              ],
              'heatmap-radius': 40,
              'heatmap-opacity': 0.7,
            }}
          />
        </Source>

        {/* Clustered Markers */}
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;
          const size = Math.min(50, 10 + (cluster.properties.point_count || 1) * 5);

          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                if (isCluster) {
                  handleClusterClick(cluster, [longitude, latitude]);
                } else {
                  const company = cluster.properties as Company;
                  setPopupInfo({ company, longitude, latitude });
                }
              }}
            >
              {isCluster ? (
                <div 
                  className="flex items-center justify-center rounded-full bg-blue-500 text-white font-bold border-2 border-white shadow-lg"
                  style={{ 
                    width: size, 
                    height: size,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {cluster.properties.point_count}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-full shadow-xl border-2 border-white hover:scale-110 transition-transform">
                  {cluster.properties.logo ? (
                    <img 
                      src={cluster.properties.logo} 
                      alt={cluster.properties.name} 
                      className="w-6 h-6 rounded-full object-contain" 
                    />
                  ) : (
                    <MapPin className="h-6 w-6 text-white" />
                  )}
                </div>
              )}
            </Marker>
          );
        })}

        {/* Company Popup */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            closeOnClick={false}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <div className="p-4 max-w-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{popupInfo.company.name}</h3>
                  {popupInfo.company.industry && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {popupInfo.company.industry}
                    </span>
                  )}
                </div>
                {popupInfo.company.logo && (
                  <img 
                    src={popupInfo.company.logo} 
                    alt={popupInfo.company.name} 
                    className="w-10 h-10 object-contain rounded" 
                  />
                )}
              </div>
              
              <div className="mt-3 space-y-2">
                {popupInfo.company.location && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {popupInfo.company.location}
                  </p>
                )}
                
                {popupInfo.company.employees && (
                  <p className="text-sm text-gray-600">
                    👥 {popupInfo.company.employees.toLocaleString()} employees
                  </p>
                )}
                
                {popupInfo.company.confidenceScore && (
                  <div className="pt-1">
                    <div className="text-xs text-gray-500 mb-1">
                      Confidence: {popupInfo.company.confidenceScore}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${popupInfo.company.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {popupInfo.company.website && (
                  <a
                    href={`https://${popupInfo.company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </Popup>
        )}

        {/* GeoJSON Layer Popup */}
        {geoJsonPopup && (
          <Popup
            longitude={geoJsonPopup.lngLat.lng}
            latitude={geoJsonPopup.lngLat.lat}
            onClose={() => setGeoJsonPopup(null)}
            closeButton={true}
            anchor="top"
            className="rounded-xl"
          >
            <div className="p-3 min-w-[180px]">
              <h3 className="font-bold text-lg">
                {geoJsonPopup.feature.properties.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {geoJsonPopup.feature.properties.description}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Value: <span className="font-semibold">{geoJsonPopup.feature.properties.value}</span>
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}