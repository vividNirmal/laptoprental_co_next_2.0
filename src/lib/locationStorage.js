/**
 * Location Storage Utility
 * Handles localStorage operations for user-selected location only
 * Location data is always fetched fresh from API, only user selection is cached
 */

const SELECTED_LOCATION_KEY = 'rentalzone_selected_location';

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = () => {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Format location display name
 * @param {Object} location - Location object
 * @returns {string} Formatted display name
 */
export const formatLocationDisplayName = (location) => {
    if (!location) return '';
    
    if (location.type === 'city') {
        return location.city;
    } else if (location.type === 'area') {
        return `${location.area}, ${location.city}`;
    }
    
    return location.city || location.area || '';
};

/**
 * Get selected location from localStorage
 * @returns {Object|null} Selected location object or null
 */
export const getSelectedLocation = () => {
    if (!isLocalStorageAvailable()) {
        return null;
    }
    
    try {
        const storedLocation = localStorage.getItem(SELECTED_LOCATION_KEY);
        return storedLocation ? JSON.parse(storedLocation) : null;
    } catch (error) {
        console.warn('Error reading selected location from localStorage:', error);
        return null;
    }
};

/**
 * Set selected location to localStorage
 * @param {Object} location - Location object to save
 * @returns {boolean} Success status
 */
export const setSelectedLocation = (location) => {
    if (!isLocalStorageAvailable() || !location) {
        return false;
    }
    
    try {
        // Only store essential location data
        const locationToStore = {
            _id: location._id,
            type: location.type,
            city: location.city,
            state: location.state,
            ...(location.area && { area: location.area })
        };
        
        localStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(locationToStore));
        return true;
    } catch (error) {
        console.error('Error saving selected location to localStorage:', error);
        return false;
    }
};

/**
 * Clear selected location from localStorage
 * @returns {boolean} Success status
 */
export const clearSelectedLocation = () => {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    
    try {
        localStorage.removeItem(SELECTED_LOCATION_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing selected location from localStorage:', error);
        return false;
    }
};

/**
 * Search locations by query string
 * @param {string} query - Search query
 * @param {Array} locations - Array of location objects from API
 * @returns {Array} Filtered locations
 */
export const searchLocations = (query, locations = []) => {
    if (!query || query.trim() === '') {
        return locations;
    }
    
    const searchQuery = query.toLowerCase().trim();
    
    return locations.filter(location => {
        const cityMatch = location.city && location.city.toLowerCase().includes(searchQuery);
        const areaMatch = location.area && location.area.toLowerCase().includes(searchQuery);
        const stateMatch = location.state && location.state.toLowerCase().includes(searchQuery);
        
        return cityMatch || areaMatch || stateMatch;
    });
};

/**
 * Find location by ID in the locations array
 * @param {string} locationId - Location ID to find
 * @param {Array} locations - Array of location objects from API
 * @returns {Object|null} Found location or null
 */
export const findLocationById = (locationId, locations = []) => {
    if (!locationId || !Array.isArray(locations)) {
        return null;
    }
    
    return locations.find(location => location._id === locationId) || null;
};

/**
 * Check if a location object is valid
 * @param {Object} location - Location object to validate
 * @returns {boolean} Is valid location
 */
export const isValidLocation = (location) => {
    return location && 
           location._id && 
           location.type && 
           location.city &&
           (location.type === 'city' || (location.type === 'area' && location.area));
};

/**
 * Get location type priority for sorting (cities first, then areas)
 * @param {Object} location - Location object
 * @returns {number} Priority number (lower is higher priority)
 */
export const getLocationTypePriority = (location) => {
    if (location.type === 'city') return 1;
    if (location.type === 'area') return 2;
    return 3;
};

/**
 * Sort locations by type and name
 * @param {Array} locations - Array of location objects
 * @returns {Array} Sorted locations
 */
export const sortLocations = (locations) => {
    return [...locations].sort((a, b) => {
        // First sort by type priority
        const typeDiff = getLocationTypePriority(a) - getLocationTypePriority(b);
        if (typeDiff !== 0) return typeDiff;
        
        // Then sort by name
        const nameA = a.type === 'city' ? a.city : a.area;
        const nameB = b.type === 'city' ? b.city : b.area;
        
        return (nameA || '').localeCompare(nameB || '');
    });
};