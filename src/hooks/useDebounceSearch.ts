import { useState, useCallback, useMemo } from "react";
import { debounce } from "../utils";

/**
 * Hook for debounced search functionality
 */
export const useDebounceSearch = (
  searchFunction: (query: string) => void,
  delay = 300,
) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        setIsSearching(true);
        searchFunction(searchQuery);
        setIsSearching(false);
      }, delay),
    [searchFunction, delay],
  );

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (newQuery.trim()) {
        debouncedSearch(newQuery);
      } else {
        setIsSearching(false);
        searchFunction("");
      }
    },
    [debouncedSearch, searchFunction],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setIsSearching(false);
    searchFunction("");
  }, [searchFunction]);

  return {
    query,
    isSearching,
    handleSearch,
    clearSearch,
  };
};
