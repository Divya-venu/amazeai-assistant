import React, { useState, useEffect, useCallback } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Globe, Info, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

// World topology from public CDN
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Map of country ISO numeric codes to common names used in sales data
const ISO_TO_NAME = {
    '840': 'USA', '356': 'India', '826': 'UK', '276': 'Germany',
    '124': 'Canada', '036': 'Australia', '250': 'France', '392': 'Japan',
    '076': 'Brazil', '156': 'China', '724': 'Spain', '380': 'Italy',
    '528': 'Netherlands', '702': 'Singapore', '410': 'South Korea',
    '784': 'UAE', '682': 'Saudi Arabia', '710': 'South Africa', '484': 'Mexico',
    '032': 'Argentina', '643': 'Russia', '616': 'Poland', '752': 'Sweden', '756': 'Switzerland',
    '056': 'Belgium', '040': 'Austria', '246': 'Finland', '578': 'Norway',
    '208': 'Denmark', '620': 'Portugal', '300': 'Greece', '203': 'Czechia',
    '348': 'Hungary', '642': 'Romania', '804': 'Ukraine', '792': 'Turkey',
    '634': 'Qatar', '586': 'Pakistan', '050': 'Bangladesh', '144': 'Sri Lanka',
    '458': 'Malaysia', '360': 'Indonesia', '764': 'Thailand', '704': 'Vietnam',
    '608': 'Philippines', '818': 'Egypt', '566': 'Nigeria', '404': 'Kenya',
    '800': 'Uganda', '716': 'Zimbabwe', '768': 'Togo', '288': 'Ghana',
};

// Normalize country string -> canonical key
const normalizeCountry = (name) => {
    if (!name) return null;
    const n = name.trim().toLowerCase();
    const aliases = {
        'united states': 'USA', 'united states of america': 'USA', 'us': 'USA',
        'usa': 'USA', 'united kingdom': 'UK', 'gb': 'UK', 'great britain': 'UK',
        'uk': 'UK', 'deutschland': 'Germany', 'germany': 'Germany', 'india': 'India', 
        'inde': 'India', 'peoples republic of china': 'China', 'china': 'China',
        'prc': 'China', 'republic of korea': 'South Korea', 'south korea': 'South Korea', 'rok': 'South Korea',
        'brasil': 'Brazil', 'brazil': 'Brazil', 'emirates': 'UAE', 'uae': 'UAE', 'united arab emirates': 'UAE',
        'canada': 'Canada', 'australia': 'Australia', 'france': 'France', 'japan': 'Japan',
        'russia': 'Russia', 'russian federation': 'Russia', 'mexico': 'Mexico', 'argentina': 'Argentina',
        'south africa': 'South Africa', 'saudi arabia': 'Saudi Arabia', 'turkey': 'Turkey', 'pakistan': 'Pakistan',
        'vietnam': 'Vietnam', 'thailand': 'Thailand', 'indonesia': 'Indonesia', 'malaysia': 'Malaysia',
        'philippines': 'Philippines', 'egypt': 'Egypt', 'nigeria': 'Nigeria', 'kenya': 'Kenya'
    };
    // Return alias if found, otherwise Title Case the original name
    if (aliases[n]) return aliases[n];
    return n.charAt(0).toUpperCase() + n.slice(1);
};

const GlobalSalesHeatmap = () => {
    const [salesData, setSalesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', value: 0 });
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        const fetchGlobalSales = async () => {
            try {
                setLoading(true);
                console.log('[Heatmap] Fetching global sales data...');
                const response = await apiClient.get('/global-sales');
                console.log('[Heatmap] API Response:', response.data);
                
                // Normalize all keys in the response
                const normalized = {};
                Object.entries(response.data).forEach(([key, val]) => {
                    const normKey = normalizeCountry(key);
                    normalized[normKey] = (normalized[normKey] || 0) + val;
                    console.log(`[Heatmap] Mapped: "${key}" -> "${normKey}" (Added: $${val}, Total: $${normalized[normKey]})`);
                });
                
                setSalesData(normalized);
                console.log('[Heatmap] Normalized Sales Data State:', normalized);
            } catch (err) {
                console.error('[GlobalSalesHeatmap] Fetch error:', err);
                setError('Failed to load global sales data');
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalSales();
    }, []);

    const maxValue = Math.max(...Object.values(salesData), 1);

    const colorScale = scaleLinear()
        .domain([0, maxValue * 0.3, maxValue * 0.7, maxValue])
        .range(['#0a1628', '#0e4d6e', '#0d9488', '#00ff88']);

    const getCountryRevenue = useCallback((geo) => {
        const code = geo.id?.toString().padStart(3, '0');
        const isoName = ISO_TO_NAME[code];
        if (isoName && salesData[isoName] !== undefined) return salesData[isoName];
        // Try to match by geo name property directly
        const geoName = geo.properties?.name;
        if (geoName && salesData[normalizeCountry(geoName)] !== undefined) {
            return salesData[normalizeCountry(geoName)];
        }
        return null;
    }, [salesData]);

    const getCountryName = (geo) => {
        const code = geo.id?.toString().padStart(3, '0');
        return ISO_TO_NAME[code] || geo.properties?.name || 'Unknown';
    };

    if (loading) {
        return (
            <div className="dashboard-card p-6 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="text-teal-400 animate-spin mb-4" size={32} />
                <p className="text-teal-300 font-bold tracking-widest uppercase text-xs">Loading Global Sales Map...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-card p-6 rounded-[2rem] bg-rose-600/5 border border-rose-500/20 flex flex-col items-center justify-center min-h-[300px]">
                <AlertCircle className="text-rose-400 mb-4" size={32} />
                <p className="text-rose-300 font-bold tracking-widest uppercase text-xs text-center">{error}</p>
            </div>
        );
    }

    const hasData = Object.keys(salesData).length > 0;
    const topCountries = Object.entries(salesData)
        .filter(([k]) => k !== 'Unknown')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <div className="dashboard-card p-6 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 shadow-xl relative overflow-hidden group">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-900/10 via-transparent to-cyan-900/10 pointer-events-none" />

            {/* Decorative globe icon */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Globe size={140} className="text-teal-500" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <Globe className="text-teal-400" size={22} />
                            Global Sales Heatmap
                        </h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Revenue by Country
                        </p>
                    </div>
                    {hasData && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <div className="w-8 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #0e4d6e, #0d9488, #00ff88)' }} />
                            </div>
                            <span>Low → High</span>
                        </div>
                    )}
                </div>

                {/* Map */}
                <div
                    className="relative rounded-2xl overflow-hidden bg-[#050c18] border border-gray-700/20"
                    style={{ height: '260px' }}
                    onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                >
                    <ComposableMap
                        projectionConfig={{ scale: 130 }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <ZoomableGroup
                            zoom={zoom}
                            onMoveEnd={({ zoom: z }) => setZoom(z)}
                        >
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const revenue = getCountryRevenue(geo);
                                        const countryName = getCountryName(geo);
                                        const hasRevenue = revenue !== null && revenue !== undefined;
                                        const fillColor = hasRevenue
                                            ? colorScale(revenue)
                                            : '#0d1f35';

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fillColor}
                                                stroke="#0a1628"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: {
                                                        fill: fillColor,
                                                        outline: 'none',
                                                        filter: hasRevenue ? 'drop-shadow(0 0 4px rgba(0,255,136,0.3))' : 'none',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    hover: {
                                                        fill: hasRevenue ? '#00ff88' : '#1a3a5e',
                                                        outline: 'none',
                                                        filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.6))',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    },
                                                    pressed: {
                                                        fill: '#00cc6a',
                                                        outline: 'none'
                                                    }
                                                }}
                                                onMouseEnter={(e) => {
                                                    setTooltip({
                                                        visible: true,
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                        name: countryName,
                                                        value: revenue
                                                    });
                                                }}
                                                onMouseMove={(e) => {
                                                    setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }));
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltip(t => ({ ...t, visible: false }));
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Tooltip */}
                    {tooltip.visible && (
                        <div
                            className="fixed z-50 pointer-events-none bg-gray-900/95 border border-teal-500/30 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm"
                            style={{
                                left: tooltip.x + 12,
                                top: tooltip.y - 60,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            <p className="text-white font-bold text-sm">{tooltip.name}</p>
                            <p className="text-teal-400 font-black text-sm">
                                {tooltip.value !== null && tooltip.value !== undefined
                                    ? `Sales: $${tooltip.value.toLocaleString()}`
                                    : 'No data'}
                            </p>
                        </div>
                    )}

                    {/* Zoom controls */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
                            className="w-7 h-7 bg-gray-800/80 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all text-center font-bold text-sm flex items-center justify-center"
                        >+</button>
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.5, 1))}
                            className="w-7 h-7 bg-gray-800/80 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all text-center font-bold text-sm flex items-center justify-center"
                        >−</button>
                    </div>
                </div>

                {/* Top Countries */}
                {topCountries.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {topCountries.map(([country, revenue]) => (
                            <div key={country} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-900/30 border border-gray-700/20">
                                <span className="text-[10px] font-black text-gray-400 uppercase">{country}</span>
                                <span className="text-xs font-black text-teal-400">${(revenue / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                )}

                {!hasData && (
                    <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs">
                        <Info size={12} />
                        <span>Upload CSV datasets with a "Country" column to see sales distribution on the map.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalSalesHeatmap;
