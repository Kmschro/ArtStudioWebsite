// Static admin page for GitHub Pages
// This is a simplified version that demonstrates the UI without actual API functionality

// DOM Elements
const artworksList = document.getElementById('artworks-list');
const uploadForm = document.getElementById('upload-form');
const uploadAlert = document.getElementById('upload-alert');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Check if user is logged in as admin, redirect if not
function checkAdminAccess() {
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (!authToken || username !== 'admin') {
        // Redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Display static artworks in admin panel
function displayAdminArtworks() {
    // Clear container
    if (!artworksList) return;
    artworksList.innerHTML = '';
    
    // Display message if no artworks found
    if (!ARTWORKS || ARTWORKS.length === 0) {
        artworksList.innerHTML = '<div class="no-artworks">No artworks found</div>';
        return;
    }
    
    // Create and append artwork items
    ARTWORKS.forEach(artwork => {
        // Fix image path for GitHub Pages
        let imageUrl = artwork.imageUrl;
        
        // If we're running on GitHub Pages, make sure the image paths are correct
        if (window.location.hostname.endsWith('github.io')) {
            // Convert relative paths to GitHub Pages format
            imageUrl = imageUrl.startsWith('/') ? 
                `${window.location.pathname}${imageUrl.substring(1)}` : 
                imageUrl;
        }
        
        const item = document.createElement('div');
        item.className = 'artwork-item';
        
        item.innerHTML = `
            <img src="${imageUrl}" alt="${artwork.title}" class="artwork-item-image" onerror="this.src='https://via.placeholder.com/150x100?text=Artwork'">
            <div class="artwork-item-info">
                <h3 class="artwork-item-title">${artwork.title}</h3>
                <a href="artwork.html?id=${artwork.id}" class="artwork-item-link" target="_blank">View Details</a>
            </div>
        `;
        
        artworksList.appendChild(item);
    });
}

// Show alert message
function showAlert(message, isError = true) {
    if (!uploadAlert) return;
    
    uploadAlert.textContent = message;
    uploadAlert.className = isError ? 'alert alert-danger' : 'alert alert-success';
    uploadAlert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        uploadAlert.style.display = 'none';
    }, 5000);
}

// Handle file input change for image preview
function setupImagePreview() {
    if (!imageInput || !imagePreview || !previewImg) return;
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });
}

// Handle form submission (mock for GitHub Pages)
function setupFormSubmission() {
    if (!uploadForm) return;
    
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // This is just a mock for GitHub Pages
        showAlert('This is a static demo. In the actual app, your artwork would be uploaded.', false);
        
        // Reset form after "submission"
        setTimeout(() => {
            uploadForm.reset();
            if (imagePreview) imagePreview.style.display = 'none';
        }, 1500);
    });
}

// Handle logout button
function setupLogout() {
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', () => {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}

// Handle refresh button
function setupRefresh() {
    if (!refreshBtn) return;
    
    refreshBtn.addEventListener('click', () => {
        displayAdminArtworks();
        showAlert('Artworks refreshed!', false);
    });
}

// Initialize the admin page
function initAdmin() {
    // Check if user has admin access
    if (!checkAdminAccess()) return;
    
    // Display artworks
    displayAdminArtworks();
    
    // Set up image preview
    setupImagePreview();
    
    // Set up form submission
    setupFormSubmission();
    
    // Set up logout button
    setupLogout();
    
    // Set up refresh button
    setupRefresh();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);