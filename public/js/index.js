// DOM Elements
const artworkContainer = document.getElementById('artwork-container');

// API endpoint
const API_URL = '/api/artworks';

// Fetch all artworks
async function fetchArtworks() {
    try {
        console.log('Fetching artworks from:', API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch artworks');
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success && data.artworks) {
            return data.artworks;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching artworks:', error);
        return [];
    }
}

// Create artwork card
function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.dataset.id = artwork.id;
    
    card.innerHTML = `
        <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image">
        <div class="artwork-info">
            <h3>${artwork.title}</h3>
            <button class="btn artwork-view-btn">View Details</button>
        </div>
    `;
    
    // Add event listener to view button
    card.querySelector('.artwork-view-btn').addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default behavior
        console.log('Clicked artwork ID:', artwork.id);
        window.location.href = `artwork.html?id=${artwork.id}`;
    });
    
    // Make the entire card clickable
    card.addEventListener('click', (e) => {
        // Don't trigger if the button was clicked (it has its own handler)
        if (!e.target.closest('.artwork-view-btn')) {
            console.log('Clicked artwork card ID:', artwork.id);
            window.location.href = `artwork.html?id=${artwork.id}`;
        }
    });
    
    return card;
}

// Display all artworks
async function displayArtworks() {
    // Show loading indicator
    artworkContainer.innerHTML = '<div class="loading">Loading artwork...</div>';
    
    // Fetch artworks
    const artworks = await fetchArtworks();
    
    // Clear container
    artworkContainer.innerHTML = '';
    
    // Display error message if no artworks found
    if (artworks.length === 0) {
        artworkContainer.innerHTML = '<div class="no-artworks">No artworks found</div>';
        return;
    }
    
    console.log('Displaying', artworks.length, 'artworks');
    
    // Create and append artwork cards
    artworks.forEach(artwork => {
        const card = createArtworkCard(artwork);
        artworkContainer.appendChild(card);
    });
}

// Initialize the app
function init() {
    console.log('Initializing application');
    displayArtworks();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);