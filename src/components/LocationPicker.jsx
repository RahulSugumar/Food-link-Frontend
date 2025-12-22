import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Search } from 'lucide-react'; // Added Search icon
import axios from 'axios';

// Fix for Leaflet default icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const LocationMarker = ({ setPosition, setAddress }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            fetchAddress(e.latlng.lat, e.latlng.lng, setAddress);
        },
    });
    return null;
};

// Helper: Reverse Geocode
const fetchAddress = async (lat, lng, setAddress) => {
    try {
        setAddress("Fetching address...");
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.data && res.data.display_name) {
            setAddress(res.data.display_name);
        } else {
            setAddress("Address not found");
        }
    } catch (error) {
        console.error("Geocoding failed", error);
        setAddress("Error fetching address");
    }
};

const LocationPicker = ({ onLocationSelect, initialLat = 27.1751, initialLng = 78.0421 }) => {
    const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });
    const [address, setAddress] = useState("Click on map to select location");
    const [map, setMap] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Initial load
    useEffect(() => {
        if (onLocationSelect) {
            onLocationSelect({ lat: position.lat, lng: position.lng, address });
        }
    }, [position, address]);

    // Sync address to search input
    useEffect(() => {
        if (address && !address.startsWith("Click") && !address.startsWith("Fetching") && !address.startsWith("Address") && !address.startsWith("Error")) {
            setSearchQuery(address);
        }
    }, [address]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault(); // Handle cases where e might be undefined if called programmatically
        if (!searchQuery) return;

        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            if (res.data && res.data.length > 0) {
                setSuggestions(res.data);
            } else {
                alert("Location not found");
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Search failed", error);
            alert("Search failed. Please try again.");
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        const { lat, lon, display_name } = suggestion;
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };

        setPosition(newPos);
        setAddress(display_name);
        setSuggestions([]); // Clear suggestions

        if (map) {
            map.flyTo(newPos, 13);
        }
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setPosition(newPos);
                    fetchAddress(latitude, longitude, setAddress);
                    if (map) map.flyTo(newPos, 13);
                },
                (err) => {
                    alert("Could not get your location. Please enable permissions.");
                    console.error(err);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="space-y-2">
            {/* Search Bar */}
            <div className="flex gap-2 relative z-[1000]">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                        placeholder="Search your address..."
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange2/20 focus:border-brand-orange2 transition-all bg-gray-50/50 focus:bg-white"
                    />
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-brand-orange2 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                    </button>

                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <ul className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-48 rounded-xl py-1 text-sm ring-1 ring-gray-100 overflow-auto">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className="cursor-pointer py-2 px-3 hover:bg-orange-50 text-gray-700 border-b last:border-b-0 border-gray-50 flex items-center gap-2"
                                >
                                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{suggestion.display_name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-gray-500 bg-white hover:bg-gray-50 hover:text-brand-orange2 transition-all"
                    title="Use my location"
                >
                    <Navigation className="h-4 w-4" />
                </button>
            </div>

            {/* Selected Address Display */}
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <MapPin className="h-3 w-3 flex-shrink-0 text-brand-orange2" />
                <span className="truncate">{address}</span>
            </div>

            {/* Compact Map */}
            <div className="h-32 w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    ref={setMap}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                    <LocationMarker setPosition={setPosition} setAddress={setAddress} />
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationPicker;
