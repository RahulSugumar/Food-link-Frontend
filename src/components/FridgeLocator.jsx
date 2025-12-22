import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, Navigation, Info, Clock, Thermometer } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

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
        if (position) map.flyTo(position, 13, { duration: 3 }); // Slower animation (3 seconds)
    }, [position, map]);
    return null;
};

const FridgeLocator = () => {
    const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [fridges, setFridges] = useState([]);
    const [selectedFridgeId, setSelectedFridgeId] = useState(null);

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
        <div className="flex flex-col md:flex-row h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 bg-gray-50 flex flex-col relative z-20">
                <div className="p-6 bg-white shadow-sm z-30">
                    <h3 className="text-2xl font-black text-gray-800 mb-4 flex items-center">
                        <MapPin className="mr-2 text-brand-orange fill-orange-100" /> Locally Available
                    </h3>

                    {/* Search */}
                    <div className="relative">
                        <div className="flex bg-gray-100 rounded-xl overflow-hidden transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-brand-orange/20">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                placeholder="Search area..."
                                className="flex-1 bg-transparent border-none text-gray-700 py-3 px-4 focus:ring-0 placeholder-gray-400"
                            />
                            <button onClick={handleSearch} className="px-4 text-gray-400 hover:text-brand-orange transition-colors">
                                <Search size={20} />
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50"
                                >
                                    {suggestions.map((s, i) => (
                                        <li key={i} onClick={() => handleSelectSuggestion(s)} className="cursor-pointer py-3 px-4 hover:bg-orange-50 border-b last:border-0 text-sm text-gray-600 truncate transition-colors">
                                            {s.display_name}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>

                        <button onClick={handleLocateMe} className="mt-3 text-sm text-brand-orange font-semibold flex items-center hover:text-orange-600 transition-colors">
                            <Navigation className="h-4 w-4 mr-1" /> Use my current location
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {fridges.map((fridge) => {
                        const isSelected = selectedFridgeId === fridge.id;
                        return (
                            <motion.div
                                key={fridge.id}
                                layoutId={fridge.id}
                                onClick={() => {
                                    if (fridge.location?.lat) {
                                        setCenter({ lat: fridge.location.lat, lng: fridge.location.lng });
                                        setSelectedFridgeId(fridge.id);
                                    }
                                }}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                    ? 'bg-orange-50 border-brand-orange shadow-md scale-[1.02]'
                                    : 'bg-white border-gray-100 hover:border-brand-orange/30 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-lg ${isSelected ? 'text-brand-orange' : 'text-gray-800'}`}>
                                        {fridge.name}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${fridge.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {fridge.status === 'active' ? 'Active' : 'Maintenance'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 flex items-start">
                                    <MapPin size={14} className="mr-1 mt-0.5 shrink-0" />
                                    {fridge.location?.address || "Address not available"}
                                </p>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center"><Clock size={12} className="mr-1" /> 24/7 Access</span>
                                    <span className="flex items-center"><Thermometer size={12} className="mr-1" /> {fridge.capacity || 'Standard'}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Map */}
            <div className="w-full md:w-2/3 relative h-full bg-gray-200">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFlyTo position={center} />

                    <Marker position={center}>
                        <Popup>
                            <div className="text-center">
                                <span className="font-bold text-brand-orange">You are here</span>
                            </div>
                        </Popup>
                    </Marker>

                    {fridges.map(fridge => (
                        fridge.location?.lat ? (
                            <Marker
                                key={fridge.id}
                                position={[fridge.location.lat, fridge.location.lng]}
                                icon={fridgeIcon}
                                eventHandlers={{
                                    click: () => setSelectedFridgeId(fridge.id),
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px]">
                                        <b className="text-lg text-gray-800">{fridge.name}</b><br />
                                        <span className="text-sm text-gray-500">{fridge.location.address}</span><br />
                                        <div className="mt-2 flex gap-2">
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${fridge.location.lat},${fridge.location.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 bg-brand-blue text-white text-center py-1 px-3 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                                            >
                                                Navigate
                                            </a>
                                        </div>
                                    </div>
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
