'use client';

import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { supabase } from '@/utils/supabaseClient';

// Higher resolution map (10m) for better detail
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapChartProps {
    userId?: string;
    darkMode?: boolean;
    onVisitedCountChange?: (count: number) => void;
}

// Zoom control icons
const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const MinusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default function MapChart({ userId, darkMode = false, onVisitedCountChange }: MapChartProps) {
    const [visited, setVisited] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });
    const [mapConfig, setMapConfig] = useState({ scale: 147, center: [0, 0] });

    // Adjust map scale based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Mobile: massive scale to fill vertically
                setMapConfig({ scale: 260, center: [0, 0] });
            } else {
                // Desktop: Standard scale
                setMapConfig({ scale: 147, center: [0, 0] });
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load visited countries from Supabase if user is logged in
    useEffect(() => {
        if (userId) {
            fetchVisitedCountries();
        }
    }, [userId]);

    // Notify parent of count changes
    useEffect(() => {
        if (onVisitedCountChange) {
            onVisitedCountChange(visited.length);
        }
    }, [visited, onVisitedCountChange]);

    const fetchVisitedCountries = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('visited_countries')
                .select('country_code')
                .eq('user_id', userId);

            if (error) {
                // If table doesn't exist, silently handle it (user needs to run schema)
                if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
                    console.warn('Database table not found. Please run the schema in Supabase.');
                    setVisited([]);
                } else {
                    console.error('Error fetching countries:', error);
                }
            } else if (data) {
                setVisited(data.map((row: any) => row.country_code));
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setVisited([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleCountry = async (geo: any) => {
        const countryCode = geo.properties.ISO_A3 || geo.id;
        const countryName = geo.properties.name || geo.properties.NAME;

        // Show country name on click
        setHoveredCountry(countryName);
        setTimeout(() => {
            if (hoveredCountry === countryName) {
                setHoveredCountry(null);
            }
        }, 2000);

        if (!countryCode) return;

        let newVisited = [...visited];
        let action = '';

        if (visited.includes(countryCode)) {
            newVisited = newVisited.filter(c => c !== countryCode);
            action = 'removed';
        } else {
            newVisited.push(countryCode);
            action = 'added';
        }

        setVisited(newVisited);

        if (userId) {
            if (action === 'added') {
                await supabase.from('visited_countries').insert({ user_id: userId, country_code: countryCode });
            } else {
                await supabase.from('visited_countries').delete().eq('user_id', userId).eq('country_code', countryCode);
            }
        }
    };

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
    };

    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
    };

    // Modern color scheme
    const bgFill = "var(--bg-primary)";
    const defaultColor = "var(--map-default)";
    const visitedColor = "var(--map-visited)";
    const hoverColor = "var(--map-hover)";
    const strokeColor = "var(--map-stroke)";

    return (
        <div className="map-container" style={{ background: bgFill }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100
                }}>
                    <div className="spinner"></div>
                </div>
            )}

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: mapConfig.scale
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryCode = geo.properties.ISO_A3 || geo.id;
                                const countryName = geo.properties.name || geo.properties.NAME;
                                const isVisited = visited.includes(countryCode);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onClick={() => toggleCountry(geo)}
                                        onMouseEnter={() => setHoveredCountry(countryName)}
                                        onMouseLeave={() => setHoveredCountry(null)}
                                        style={{
                                            default: {
                                                fill: isVisited ? visitedColor : defaultColor,
                                                outline: "none",
                                                stroke: strokeColor,
                                                strokeWidth: 0.5,
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            },
                                            hover: {
                                                fill: isVisited ? visitedColor : hoverColor,
                                                outline: "none",
                                                cursor: "pointer",
                                                stroke: strokeColor,
                                                strokeWidth: 0.5,
                                                filter: "brightness(1.1)"
                                            },
                                            pressed: {
                                                fill: visitedColor,
                                                outline: "none"
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Zoom Controls */}
            <div className="map-controls">
                <button
                    onClick={handleZoomIn}
                    className="zoom-btn"
                    disabled={position.zoom >= 4}
                    title="Zoom in"
                >
                    <PlusIcon />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="zoom-btn"
                    disabled={position.zoom <= 1}
                    title="Zoom out"
                >
                    <MinusIcon />
                </button>
            </div>

            {/* Country Tooltip */}
            <div className={`country-tooltip ${hoveredCountry ? 'visible' : ''}`}>
                {hoveredCountry}
            </div>
        </div>
    );
}
