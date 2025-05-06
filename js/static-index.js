// DOM Elements
const artworkContainer = document.getElementById('artwork-container');
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');
const adminLink = document.getElementById('admin-link');

// Create artwork card
function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.dataset.id = artwork.id;
    
    // Fix image path for GitHub Pages
    let imageUrl = artwork.imageUrl;
    
    // If we're running on GitHub Pages, make sure the image paths are correct
    if (window.location.hostname.endsWith('github.io')) {
        // Convert relative paths to GitHub Pages format
        imageUrl = imageUrl.startsWith('/') ? 
            `${window.location.pathname}${imageUrl.substring(1)}` : 
            imageUrl;
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${artwork.title}" class="artwork-image" onerror="this.src='https://via.placeholder.com/300x200?text=Artwork+Image'">
        <div class="artwork-info">
            <h3>${artwork.title}</h3>
            <button class="btn artwork-view-btn">View Details</button>
        </div>
    `;
    
    // Add event listener to view button
    card.querySelector('.artwork-view-btn').addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default behavior
        console.log('Clicked artwork ID:', artwork.id);
        
        // Store the selected artwork in localStorage for the detail page
        localStorage.setItem('selectedArtwork', JSON.stringify(artwork));
        window.location.href = `artwork.html?id=${artwork.id}`;
    });
    
    // Make the entire card clickable
    card.addEventListener('click', (e) => {
        // Don't trigger if the button was clicked (it has its own handler)
        if (!e.target.closest('.artwork-view-btn')) {
            console.log('Clicked artwork card ID:', artwork.id);
            
            // Store the selected artwork in localStorage for the detail page
            localStorage.setItem('selectedArtwork', JSON.stringify(artwork));
            window.location.href = `artwork.html?id=${artwork.id}`;
        }
    });
    
    return card;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get username from localStorage
function getUsername() {
    return localStorage.getItem('username');
}

// Check if user is admin
function isAdminUser() {
    return getUsername() === 'admin';
}

// Handle logout
function handleLogout() {
    console.log('Logging out...');
    // Remove auth token and user info from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Update UI based on authentication state
function updateAuthUI() {
    if (isLoggedIn()) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        // Show admin link if user is admin
        if (adminLink && isAdminUser()) {
            adminLink.style.display = 'inline-block';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Display artworks from static data
function displayArtworks() {
    // Clear container
    artworkContainer.innerHTML = '';
    
    // Display error message if no artworks found
    if (!ARTWORKS || ARTWORKS.length === 0) {
        artworkContainer.innerHTML = '<div class="no-artworks">No artworks found</div>';
        return;
    }
    
    console.log('Displaying', ARTWORKS.length, 'artworks');
    
    // Create and append artwork cards
    ARTWORKS.forEach(artwork => {
        const card = createArtworkCard(artwork);
        artworkContainer.appendChild(card);
    });
}

// Initialize the app
function init() {
    console.log('Initializing static application');
    
    // Update authentication UI
    updateAuthUI();
    
    // Set up logout button handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Display artworks
    displayArtworks();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);