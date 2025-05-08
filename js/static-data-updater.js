// This script ensures that artwork data from localStorage is used across all pages

// Load artworks from localStorage, falling back to static data
function loadArtworks() {
    const savedArtworks = localStorage.getItem('artworks');
    
    if (savedArtworks) {
        // Parse saved artworks from localStorage
        const parsedArtworks = JSON.parse(savedArtworks);
        
        // If this is a valid array with at least one item, use it
        if (Array.isArray(parsedArtworks) && parsedArtworks.length > 0) {
            console.log('Loaded artworks from localStorage:', parsedArtworks.length);
            
            // Override the global ARTWORKS variable with localStorage data
            window.ARTWORKS = parsedArtworks;
            return parsedArtworks;
        }
    }
    
    // If we get here, either there was no saved data or it was invalid
    // Initialize localStorage with static data
    localStorage.setItem('artworks', JSON.stringify(ARTWORKS));
    console.log('Initialized localStorage with static artworks:', ARTWORKS.length);
    
    return ARTWORKS;
}

// Run this immediately when the script loads
(function initializeData() {
    // Load the artworks and update the global variable
    window.ARTWORKS = loadArtworks();
    
    console.log('Data initialization complete');
})();