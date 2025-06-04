import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router';

const API_BASE_URL = 'http://127.0.0.1:3000';

const SearchField = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isPopoutVisible, setIsPopoutVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchContainerRef = useRef(null);
    const token = localStorage.getItem('token');

    const performSearch = useCallback(async (searchTerm) => {
        if (!token) {
            console.error("No auth token found");
            setError("Authentication token is missing. Please log in.");
            setSearchResults([]);
            return [];
        }

        const trimmedSearchTerm = searchTerm.trim();
        if (!trimmedSearchTerm) {
            setSearchResults([]);
            setError(null);
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
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (query.trim() === '') {
            setSearchResults([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsPopoutVisible(true);

        const timerId = setTimeout(() => {
            performSearch(query).then(notes => {
                setSearchResults(notes);
                if (notes.length === 0 && query.trim() !== '') {
                    setIsPopoutVisible(true);
                }
            });
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [query, performSearch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsPopoutVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
        if (newQuery.trim() !== '') {
            setIsPopoutVisible(true);
        } else {
            setIsPopoutVisible(false);
            setSearchResults([]);
            setError(null);
        }
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        if (query.trim() !== '' || isLoading || error || searchResults.length > 0) {
            setIsPopoutVisible(true);
        }
    };

    const handleInputBlur = () => {
        setIsFocused(false);
    };

    return (
        <div ref={searchContainerRef} className="relative w-full">
            <div>
                <div className={`relative flex items-center w-full rounded-lg transition-all duration-75 ease-out
                    ${isFocused
                        ? 'bg-stone-50 shadow-inputfocus'
                        : 'bg-stone-100/85 hover:bg-stone-100 shadow-input'
                    }
                `}
                >
                    <div className="pl-2 pr-1 select-none -mb-1.5 w-fit">
                        {isLoading
                            ? <span className="material-symbols-outlined text-stone-700 animate-spin">
                                progress_activity
                            </span>
                            : <span
                                className="material-symbols-outlined text-stone-700"
                                aria-hidden="true">
                                search
                            </span>
                        }
                    </div>
                    <input
                        type="search"
                        className="flex-grow -mt-0.5 py-1.5 pr-2 bg-transparent text-stone-700 placeholder:text-stone-500 focus:outline-none appearance-none w-full"
                        placeholder="Поиск в заметках"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <span
                        className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-10"
                        aria-hidden="true"
                    >
                        <svg
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                        </svg>
                    </span>
                </div>
            </div>

            {isPopoutVisible && (query.trim() !== '' || error) && (
                <div className="absolute top-full right-0 mt-2 w-full z-10 rounded-lg bg-stone-50/85 shadow-button backdrop-blur-xs pl-2 pr-1 py-1.5 flex flex-col gap-2">
                    {isLoading && <p className="text-stone-500 text-sm animate-pulse">Поиск...</p>}
                    {error && <p className="text-rose-700">Ошибка: {error}</p>}

                    {!isLoading && !error && query.trim() !== '' && searchResults.length === 0 && (
                        <p className="text-stone-500 text-sm">Нет заметок, содержащих "{query}".</p>
                    )}

                    {searchResults.length > 0 && (
                        searchResults.map(note => (
                            <Link to={`/dashboard${note.path}`} onClick={() => setQuery('')} key={note._id}>
                                <div>
                                    <p className="text-stone-700/85 font-semibold hover:text-stone/700">{note.title}</p>
                                    <div className="text-sm text-stone-500 -mt-0.5">{note.path}</div>
                                </div>
                            </Link>
                        ))
                    )}

                    <span
                        className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-10"
                        aria-hidden="true"
                    >
                        <svg
                            width="100%"
                            height="100%"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                        </svg>
                    </span>
                </div>
            )}
        </div>
    );
};

export default SearchField;