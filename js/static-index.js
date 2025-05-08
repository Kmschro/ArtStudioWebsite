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
    
    // Use the image URL directly - it can be a path or a data URL
    let imageUrl = artwork.imageUrl;
    
    // Only fix path if it's a relative path, not a data URL
    if (!imageUrl.startsWith('data:') && window.location.hostname.endsWith('github.io')) {
        // Convert relative paths to GitHub Pages format
        imageUrl = imageUrl.startsWith('/') ? 
            `${window.location.pathname}${imageUrl.substring(1)}` : 
            imageUrl;
    }
    
    card.innerHTML = `
          <img src="${imageUrl}" alt="${artwork.title}" class="artwork-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'><rect fill=\\'%23cccccc\\' width=\\'300\\' height=\\'200\\'/><text fill=\\'%23333333\\' font-family=\\'Arial,sans-serif\\' font-size=\\'14\\' x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'>${artwork.title}</text></svg>'">
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

// Display artworks from static data plus localStorage
function displayArtworks() {
    // Get all artworks (including user-added ones)
    const allArtworks = getAllArtworks();
    
    // Clear container
    artworkContainer.innerHTML = '';
    
    // Display error message if no artworks found
    if (!allArtworks || allArtworks.length === 0) {
        artworkContainer.innerHTML = '<div class="no-artworks">No artworks found</div>';
        return;
    }
    
    console.log('Displaying', allArtworks.length, 'artworks');
    
    // Create and append artwork cards
    allArtworks.forEach(artwork => {
        const card = createArtworkCard(artwork);
        artworkContainer.appendChild(card);
    });
}

// Initialize the app
function init() {
    console.log('Initializing enhanced static application');
    
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