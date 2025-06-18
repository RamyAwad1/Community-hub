import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout.jsx'; 


const NominatimSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to debounce API calls, so we don't hit the API on every keystroke
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Nominatim API endpoint for search
      const NOMINATIM_URL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`;
      
      console.log("Fetching Nominatim URL:", NOMINATIM_URL);

      const response = await fetch(NOMINATIM_URL, {
        headers: {
          'User-Agent': 'CommunityHubApp/1.0 (your-email@example.com)' 
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      console.log("Nominatim API Results:", data);
    } catch (err) {
      console.error("Error fetching location data:", err);
      setError("Failed to fetch locations. Please try again. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []); 

  // Debounced version of performSearch
  const debouncedSearch = useCallback(debounce(performSearch, 500), [performSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value); // Use the debounced function for typing
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Location Search (Powered by OpenStreetMap)</h1>
        <p className="text-gray-600 mb-8 text-center">
          Type a location to see suggestions from the OpenStreetMap Nominatim API.
        </p>

        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for a city, address, or landmark..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {loading && <p className="text-blue-600 text-center">Searching for locations...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Search Results:</h2>
            <ul className="space-y-3">
              {results.map((result) => (
                <li key={result.place_id} className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
                  <p className="font-bold text-lg text-gray-800">{result.display_name}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {result.type} |
                    <span className="font-medium ml-2">Class:</span> {result.class} |
                    <span className="font-medium ml-2">Latitude:</span> {result.lat} |
                    <span className="font-medium ml-2">Longitude:</span> {result.lon}
                  </p>
                 
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchTerm.length > 0 && !loading && !error && results.length === 0 && (
          <p className="text-gray-500 text-center mt-8">No results found for "{searchTerm}".</p>
        )}
      </div>
    </Layout>
  );
};

export default NominatimSearchPage;
