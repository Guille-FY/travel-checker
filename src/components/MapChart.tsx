'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { supabase } from '@/utils/supabaseClient';
import { geoCentroid } from 'd3-geo';

// Higher resolution map (50m) to include micro-states like Andorra
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

interface MapChartProps {
    userId?: string;
    onVisitedCountChange?: (count: number) => void;
}

// Icons
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

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

export default function MapChart({ userId, onVisitedCountChange }: MapChartProps) {
    const [visited, setVisited] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });
    const [mapConfig, setMapConfig] = useState({ scale: 147 });
    const [initialZoom, setInitialZoom] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [animatingCountry, setAnimatingCountry] = useState<string | null>(null);
    const geoList = useRef<any[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const ignoreMapClickRef = useRef(false); // Ref to block map clicks during search interaction

    // Adjust map scale based on screen width
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                // Mobile: massive scale and zoom to fill screen completely
                setMapConfig({ scale: 250 });
                setInitialZoom(1.4);
                setPosition(pos => ({ ...pos, zoom: 1.4 }));
            } else {
                // Desktop: Standard scale
                setMapConfig({ scale: 147 });
                setInitialZoom(1);
                setPosition(pos => ({ ...pos, zoom: 1 }));
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

    // Click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchVisitedCountries = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('visited_countries')
                .select('country_code')
                .eq('user_id', userId);

            if (error) {
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

    const toggleCountry = async (geo: any, bypassCheck = false) => {
        // If we are ignoring map clicks and not bypassing, return early
        if (!bypassCheck && ignoreMapClickRef.current) return;

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
        if (position.zoom >= 50) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
    };

    const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
        setPosition(position);
    };

    // Search Logic
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 1 && geoList.current.length > 0) {
            const results = geoList.current.filter(geo => {
                const name = geo.properties.name || geo.properties.NAME || "";
                return name.toLowerCase().includes(term.toLowerCase());
            });
            setSearchResults(results.slice(0, 5)); // Limit to 5 results
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectCountry = (geo: any, event?: React.MouseEvent) => {
        // Stop propagation if event exists (to prevent map click underneath)
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // Calculate the center of the country
        const centroid = geoCentroid(geo);
        const countryName = geo.properties.name || geo.properties.NAME;
        const countryCode = geo.properties.ISO_A3 || geo.id;

        // Block map clicks temporarily
        ignoreMapClickRef.current = true;
        setTimeout(() => {
            ignoreMapClickRef.current = false;
        }, 500);

        // Always toggle the country status (add or remove)
        if (countryCode) {
            // Bypass the check since this is a direct action
            const bypassCheck = true;
            toggleCountry(geo, bypassCheck);
        }

        // Don't zoom or move the map
        // Trigger animation for the specific country
        setAnimatingCountry(countryCode);

        // Clear search after a delay to show the "VISITED" state
        setTimeout(() => {
            setSearchTerm("");
            setSearchResults([]);
            setAnimatingCountry(null);
        }, 1500);
    };

    // Modern color scheme
    const bgFill = "var(--bg-primary)";
    const defaultColor = "var(--map-default)";
    const visitedColor = "var(--map-visited)";
    const hoverColor = "var(--map-hover)";
    const strokeColor = "var(--map-stroke)";

    return (
        <div className="map-container" style={{ background: bgFill, position: 'relative' }}>
            {/* Overlay to block map interaction when search has results */}
            {(searchResults.length > 0 || searchTerm.length > 0) && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 40, // Below search (50) but above map
                        background: 'transparent'
                    }}
                    onClick={() => {
                        setSearchResults([]);
                        setSearchTerm("");
                    }}
                />
            )}
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

            {/* Search Bar */}
            <div ref={searchRef} className="search-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: isMobile ? '120px' : '20px', // Lower on mobile to clear hamburger button (50px top + 48px height + padding)
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50,
                    width: '90%',
                    maxWidth: '400px'
                }}>
                <div style={{
                    position: 'relative',
                    width: '100%'
                }}>
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-secondary)',
                        pointerEvents: 'none'
                    }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a country..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)', // Solid background for better visibility
                            color: 'var(--text-primary)',
                            fontSize: '16px', // Prevents iOS zoom
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    />
                    {searchResults.length > 0 && (
                        <div className="search-results" style={{
                            position: 'absolute',
                            top: '120%',
                            left: '0',
                            right: '0',
                            background: 'var(--bg-secondary)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-xl)',
                            border: '1px solid var(--border-color)',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.map((geo, idx) => {
                                const name = geo.properties.name || geo.properties.NAME;
                                const countryCode = geo.properties.ISO_A3 || geo.id;
                                const isVisited = visited.includes(countryCode);
                                const isAnimating = animatingCountry === countryCode;

                                return (
                                    <div
                                        key={idx}
                                        onClick={(e) => handleSelectCountry(geo, e)}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onTouchEnd={(e) => e.stopPropagation()}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-color)' : 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.3s ease',
                                            background: isAnimating ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                            transform: isAnimating ? 'scale(1.02)' : 'scale(1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isAnimating) e.currentTarget.style.background = 'var(--bg-tertiary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isAnimating) e.currentTarget.style.background = 'var(--bg-secondary)';
                                        }}
                                    >
                                        <span style={{
                                            color: 'var(--text-primary)',
                                            fontWeight: isAnimating ? '600' : '400'
                                        }}>{name}</span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {isAnimating && (
                                                <span style={{
                                                    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    fontSize: '16px'
                                                }}>✨</span>
                                            )}
                                            {isVisited && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    background: isAnimating ? 'var(--success)' : 'var(--accent-primary)',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    transition: 'all 0.3s ease',
                                                    transform: isAnimating ? 'scale(1.1)' : 'scale(1)'
                                                }}>VISITED</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: mapConfig.scale
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    // CRITICAL FIX: Completely disable pointer events on the map when search is active
                    // This makes the map "ghost" to clicks, so they can't possibly register
                    pointerEvents: (searchResults.length > 0 || searchTerm.length > 0) ? 'none' : 'auto'
                }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    maxZoom={50} // Increased zoom limit significantly
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) => {
                            // Store geographies for search (only once)
                            if (geoList.current.length === 0 && geographies && geographies.length > 0) {
                                geoList.current = geographies;
                            }

                            return geographies.map((geo) => {
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
                                                strokeWidth: 0.3, // Thinner stroke for better micro-country visibility
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            },
                                            hover: {
                                                fill: isVisited ? visitedColor : hoverColor,
                                                outline: "none",
                                                cursor: "pointer",
                                                stroke: strokeColor,
                                                strokeWidth: 0.3, // Thinner stroke for better micro-country visibility
                                                filter: "brightness(1.1)"
                                            },
                                            pressed: {
                                                fill: visitedColor,
                                                outline: "none"
                                            }
                                        }}
                                    />
                                );
                            });
                        }}
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Zoom Controls */}
            <div className="map-controls">
                <button
                    onClick={handleZoomIn}
                    className="zoom-btn"
                    disabled={position.zoom >= 50}
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
