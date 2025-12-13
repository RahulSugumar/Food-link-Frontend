import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, Navigation, Info } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';

// Fix icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Fridge Icon (Green)
const fridgeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to fly to location
const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 13);
    }, [position, map]);
    return null;
};

const FridgeLocator = () => {
    const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [fridges, setFridges] = useState([]);

    // Fetch Fridges from Backend
    useEffect(() => {
        const fetchFridges = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/fridges');
                if (res.data) {
                    setFridges(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch fridges", error);
            }
        };
        fetchFridges();
    }, []);

    // Search Logic
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
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
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        const { lat, lon, display_name } = suggestion;
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setCenter(newPos);
        setSuggestions([]);
        setSearchQuery(display_name);
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCenter(newPos);
                    // Reverse geocode to show name in search bar
                    axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`)
                        .then(res => {
                            if (res.data && res.data.display_name) setSearchQuery(res.data.display_name);
                        });
                },
                () => alert("Could not get location")
            );
        } else {
            alert("Geolocation not supported");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row h-[600px]">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <MapPin className="mr-2 text-brand-orange" /> Nearby Fridges
                </h3>

                {/* Search */}
                <div className="relative mb-6 z-50">
                    <div className="flex shadow-sm rounded-md">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            placeholder="Search location..."
                            className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-brand-orange focus:border-brand-orange sm:text-sm p-2 bg-white"
                        />
                        <button onClick={handleSearch} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 text-sm hover:bg-gray-200">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Dropdown */}
                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                            {suggestions.map((s, i) => (
                                <li key={i} onClick={() => handleSelectSuggestion(s)} className="cursor-pointer py-2 px-4 hover:bg-orange-50 border-b last:border-0 truncate">
                                    {s.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={handleLocateMe} className="mt-2 text-sm text-brand-orange flex items-center hover:underline">
                        <Navigation className="h-3 w-3 mr-1" /> Use my location
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {fridges.map(fridge => (
                        <div key={fridge.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                if (fridge.location && fridge.location.lat && fridge.location.lng) {
                                    setCenter({ lat: fridge.location.lat, lng: fridge.location.lng });
                                }
                            }}>
                            <h4 className="font-semibold text-gray-900">{fridge.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{fridge.location?.address || "Address not available"}</p>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="bg-green-100 text-brand-green px-2 py-1 rounded-full">{fridge.status === 'active' ? 'Open 24/7' : 'Maintenence'}</span>
                                <span className="text-gray-400">Capacity: {fridge.capacity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="w-full md:w-2/3 relative z-0">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFlyTo position={center} />

                    {/* User Marker */}
                    <Marker position={center}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Fridge Markers */}
                    {fridges.map(fridge => (
                        fridge.location && fridge.location.lat && fridge.location.lng ? (
                            <Marker key={fridge.id} position={[fridge.location.lat, fridge.location.lng]} icon={fridgeIcon}>
                                <Popup>
                                    <b>{fridge.name}</b><br />
                                    {fridge.location.address}<br />
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${fridge.location.lat},${fridge.location.lng}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Get Directions</a>
                                </Popup>
                            </Marker>
                        ) : null
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default FridgeLocator;
