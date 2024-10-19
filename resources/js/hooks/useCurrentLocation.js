import { useEffect, useState } from "react";

export const useCurrentLocation = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const getLocation = () => {
        if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser");
          setLoading(false);
          return;
        }
  
        const success = (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        };
  
        const error = (err) => {
          setError(`Error retrieving location: ${err.message}`);
          setLoading(false);
        };
  
        navigator.geolocation.getCurrentPosition(success, error);
      };
  
      getLocation();
  
    }, []);
  
    return { currentLocation, loading, error };
  }
  