import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["/api/search", { q: query, ...location }],
    enabled: !!query,
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/medicines/search", { q: query }],
    enabled: !!query && query.length > 2,
  });

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return {
    query,
    setQuery,
    location,
    getUserLocation,
    searchResults,
    suggestions,
    isLoading,
    suggestionsLoading,
    error,
  };
}
