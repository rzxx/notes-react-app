import React, { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:3000';

const SearchField = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    // Memoize the search function to avoid re-creating it on every render
    // unless the `token` changes.
    const performSearch = useCallback(async (searchTerm) => {
        if (!token) {
            console.error("No auth token found");
            setError("Authentication token is missing. Please log in.");
            setSearchResults([]); // Clear previous results
            return [];
        }

        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm) {
            setSearchResults([]); // Clear results if search term is empty
            setError(null); // Clear any previous errors
            return [];
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/notes/search?q=${encodeURIComponent(trimmedSearchTerm)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                // If the backend returns a 400 for an empty query (as per backend code),
                // treat it as "no results" rather than a generic error.
                if (response.status === 400 && errorData.error?.toLowerCase().includes('query "q" is required')) {
                    setSearchResults([]);
                    return [];
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const notes = await response.json();
            return notes;
        } catch (err) {
            console.error("Failed to search notes:", err);
            setError(err.message || "Failed to fetch search results.");
            return []; // Return empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [token]); // Dependency: token

    // Effect for debounced searching
    useEffect(() => {
        // If query is empty after trimming, clear results and don't search.
        if (query.trim() === '') {
            setSearchResults([]);
            setError(null);
            setIsLoading(false); // Ensure loading is off
            return;
        }

        // Show loading immediately for better UX while debouncing
        setIsLoading(true);
        setError(null);

        const timerId = setTimeout(() => {
            performSearch(query).then(notes => {
                setSearchResults(notes);
            });
        }, 500); // 500ms debounce delay

        // Cleanup function to clear the timer if query changes before timeout
        // or if the component unmounts.
        return () => {
            clearTimeout(timerId);
        };
    }, [query, performSearch]); // Re-run effect if query or performSearch function changes

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    return (
        <div>
            <span className="relative block">
                <span className="absolute left-1 top-1.5 material-symbols-outlined text-stone-500">search</span>
                <input
                    type="search" // "search" type often gives a clear button in browsers
                    className="pl-8 bg-stone-100 py-1.5 px-2 rounded-lg shadow-input text-stone-700 placeholder:text-stone-500
                outline-0 focus:shadow-inputfocus focus:bg-stone-50 hover:bg-stone-50
                transition duration-75 ease-out"
                    placeholder="Поиск заметок"
                    value={query}
                    onChange={handleInputChange}
                />
                <span
                    className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-10"
                    aria-hidden="true"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 200 200"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                    </svg>
                </span>
            </span>


            {isLoading && <p>Searching...</p>}
            {error && <p className="text-rose-700">Error: {error}</p>}

            {!isLoading && !error && query.trim() !== '' && searchResults.length === 0 && (
                <p>No notes found matching "{query}".</p>
            )}

            {searchResults.length > 0 && (
                <ul>
                    {searchResults.map(note => (
                        <li key={note._id}>
                            <strong>{note.title}</strong>
                            <div>Path: {note.path}</div>
                            {/* You might want to make these clickable to navigate to the note */}
                            {/* Example: <Link to={`/notes${note.path}`}>{note.title}</Link> */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchField;