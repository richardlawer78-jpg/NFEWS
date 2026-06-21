import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { getAllZones } from "../../api/zonesApi";
import Navbar from "../../components/layout/Navbar";
import { getRiskColor, getRiskLabel } from "../../utils/riskColors";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 10, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const MapView = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [flyTo, setFlyTo] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await getAllZones();
        setZones(data.districts || []);
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const results = zones.filter(z =>
      z.name.toLowerCase().includes(search.toLowerCase()) ||
      z.region_name?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 6);
    setSearchResults(results);
  }, [search, zones]);

  const handleSelectZone = (zone) => {
    setFlyTo([parseFloat(zone.lat), parseFloat(zone.lng)]);
    setSelectedZone(zone);
    setSearch(zone.name);
    setSearchResults([]);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelectedZone(null);
    setFlyTo(null);
  };

  const filtered = filter === "all"
    ? zones
    : zones.filter(z => z.risk_level === filter);

  if (loading) return <div className="loading">Loading map data...</div>;

  return (
    <div className="page-content">
      <Navbar title="Flood Risk Map" />
      <div className="map-body">
        <div className="map-toolbar">
          <div className="map-search-wrap">
            <span className="map-search-icon">??</span>
            <input
              type="text"
              className="map-search-input"
              placeholder="Search town or district..."
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <button className="map-search-clear" onClick={() => { setSearch(""); setSearchResults([]); setSelectedZone(null); }}>?</button>
            )}
            {searchResults.length > 0 && (
              <div className="map-search-dropdown">
                {searchResults.map(zone => (
                  <div key={zone.id} className="map-search-item" onClick={() => handleSelectZone(zone)}>
                    <span className="search-item-dot" style={{ background: getRiskColor(zone.risk_level) }}></span>
                    <div>
                      <div className="search-item-name">{zone.name}</div>
                      <div className="search-item-region">{zone.region_name} — {zone.country_name}</div>
                    </div>
                    <span className="search-item-risk" style={{ color: getRiskColor(zone.risk_level) }}>
                      {getRiskLabel(zone.risk_level)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-buttons">
            {["all", "critical", "danger", "caution", "safe"].map(level => (
              <button
                key={level}
                className={"filter-btn " + (filter === level ? "active" : "")}
                onClick={() => setFilter(level)}
                style={filter === level && level !== "all" ? {
                  background: getRiskColor(level),
                  borderColor: getRiskColor(level),
                  color: "white"
                } : {}}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <span className="map-count">Showing {filtered.length} districts</span>
        </div>

        {selectedZone && (
          <div className="map-selected-banner">
            <span style={{ color: getRiskColor(selectedZone.risk_level) }}>?</span>
            <strong>{selectedZone.name}</strong>
            <span>{selectedZone.region_name} — {selectedZone.country_name}</span>
            <span className="selected-risk" style={{ color: getRiskColor(selectedZone.risk_level) }}>
              {getRiskLabel(selectedZone.risk_level)}
            </span>
            <span>?? {selectedZone.water_level_threshold_m}m</span>
            <span>??? {selectedZone.rainfall_threshold_mm}mm</span>
          </div>
        )}

        <div className="map-legend">
          <span>?? Safe</span>
          <span>?? Caution</span>
          <span>?? Danger</span>
          <span>?? Critical</span>
        </div>

        <MapContainer center={[8.0, -2.0]} zoom={6} className="leaflet-map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="©? OpenStreetMap contributors"
          />
          <FlyToLocation coords={flyTo} />
          {filtered.map(zone => (
            <CircleMarker
              key={zone.id}
              center={[parseFloat(zone.lat), parseFloat(zone.lng)]}
              radius={zone.risk_level === "critical" ? 12 : zone.risk_level === "danger" ? 10 : zone.risk_level === "caution" ? 8 : 6}
              fillColor={getRiskColor(zone.risk_level)}
              color={getRiskColor(zone.risk_level)}
              fillOpacity={0.8}
              weight={1}
            >
              <Popup>
                <div className="map-popup">
                  <h4>{zone.name}</h4>
                  <p>{zone.region_name} — {zone.country_name}</p>
                  <span style={{ background: getRiskColor(zone.risk_level), color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
                    {getRiskLabel(zone.risk_level)}
                  </span>
                  <p>?? Water threshold: {zone.water_level_threshold_m}m</p>
                  <p>??? Rainfall threshold: {zone.rainfall_threshold_mm}mm</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
