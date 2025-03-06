import { useState, useEffect, useRef, createContext, useContext } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import "ol/ol.css";
import { TbSearch } from "react-icons/tb";
const AddressPickerContext = createContext();

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

const AddressPicker = ({ children, setGeoInfo = () => { }  }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState([14.5995, 120.9842]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const viewRef = useRef(null);
  const fromSearchRef = useRef(false);

  useEffect(()=>{
    setGeoInfo({
      name: searchQuery,
      lng: location[1],
      lat: location[0]
    });
  },[location, searchQuery])

  const selectLocation = (lat, lon, displayName) => {
    fromSearchRef.current = true;
    setLocation([parseFloat(lat), parseFloat(lon)]);
    setSearchQuery(displayName);
    setShowDropdown(false);
  };

  const forwardGeocodeSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${searchQuery}&format=json`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const reverseGeocodeSearch = async () => {
    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${location[0]}&lon=${location[1]}&format=json`
      );
      const data = await res.json();
      setSearchQuery(data.display_name);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
  };

  return (
    <AddressPickerContext.Provider value={{
      forwardGeocodeSearch, reverseGeocodeSearch,
      searchQuery, setSearchQuery,
      suggestions, setSuggestions,
      showDropdown, setShowDropdown,
      location, setLocation,
      mapRef,
      markerRef,
      vectorLayerRef,
      viewRef,
      fromSearchRef,
      selectLocation
    }}>

      <div>
        {children}
      </div>
    </AddressPickerContext.Provider>
  )
}

const Picker = ({}) => {
  const {
    forwardGeocodeSearch, reverseGeocodeSearch,
    searchQuery, setSearchQuery,
    suggestions, setSuggestions,
    showDropdown, setShowDropdown,
    location, setLocation,
    mapRef,
    markerRef,
    vectorLayerRef,
    viewRef,
    fromSearchRef,
    selectLocation
  } = useContext(AddressPickerContext);

  useEffect(() => {
    const view = new View({
      center: fromLonLat([location[1], location[0]]),
      zoom: 13,
    });

    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          }),
        }),
      ],
      view: view,
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat([location[1], location[0]])),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
          scale: 0.25,
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [marker],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);

    map.on("click", (event) => {
      const coords = toLonLat(event.coordinate);
      fromSearchRef.current = false;
      setLocation([coords[1], coords[0]]);
    });

    mapRef.current = map;
    markerRef.current = marker;
    vectorLayerRef.current = vectorLayer;
    viewRef.current = view;
  }, []);

  useEffect(() => {
    if (markerRef.current && viewRef.current) {
      const markerGeometry = markerRef.current.getGeometry();
      const startCoords = markerGeometry.getCoordinates();
      const endCoords = fromLonLat([location[1], location[0]]);

      let progress = 0;
      const duration = 500; // Animation duration in ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        const interpolatedCoords = [
          startCoords[0] + (endCoords[0] - startCoords[0]) * progress,
          startCoords[1] + (endCoords[1] - startCoords[1]) * progress,
        ];
        markerGeometry.setCoordinates(interpolatedCoords);
        if (fromSearchRef.current) {
          viewRef.current.setCenter(interpolatedCoords);
        }
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [location]);

  useEffect(() => {
    reverseGeocodeSearch();
  }, [location])

  return (
    <div id="map" className="h-full w-full"></div>
  );
};

const Searchbar = ({ }) => {
  const {
    forwardGeocodeSearch, reverseGeocodeSearch,
    searchQuery, setSearchQuery,
    suggestions, setSuggestions,
    showDropdown, setShowDropdown,
    location, setLocation,
    mapRef,
    markerRef,
    vectorLayerRef,
    viewRef,
    fromSearchRef,
    selectLocation
  } = useContext(AddressPickerContext);

  const autoComplete = (e) => {
    setSearchQuery(e.target.value);
    //forwardGeocodeSearch();
  }

  return (
    <div className="relative w-full">
      <div className="border-card flex">
        <input
          type="text"
          value={searchQuery}
          onChange={autoComplete}
          placeholder="Search Address..."
          className="rounded-md w-full border-none bg-transparent"
        />
        <button className="text-neutral" onClick={forwardGeocodeSearch}><TbSearch size={24} /></button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute w-full bg-background backdrop-blur border rounded mt-1 max-h-60 overflow-auto z-10">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => selectLocation(place.lat, place.lon, place.display_name)}
              className="p-1 text-sm cursor-pointer hover:bg-hbg truncate"
              title={place.display_name}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

AddressPicker.Searchbar = Searchbar;
AddressPicker.Picker = Picker;

export default AddressPicker;