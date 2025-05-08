// Enhanced admin page for GitHub Pages
// This version actually saves artworks to localStorage

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

// Display artworks in admin panel
function displayAdminArtworks() {
    // Clear container
    if (!artworksList) return;
    artworksList.innerHTML = '';
    
    // Get user artworks
    const userArtworks = getCurrentUserArtworks();
    
    // Display message if no artworks found
    if (!userArtworks || userArtworks.length === 0) {
        artworksList.innerHTML = '<div class="no-artworks">No artworks found</div>';
        return;
    }
    
    // Create and append artwork items
    userArtworks.forEach(artwork => {
        const item = document.createElement('div');
        item.className = 'artwork-item';
        
        item.innerHTML = `
            <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-item-image" onerror="this.src='https://via.placeholder.com/150x100?text=Artwork'">
            <div class="artwork-item-info">
                <h3 class="artwork-item-title">${artwork.title}</h3>
                <div class="artwork-item-actions">
                    <a href="artwork.html?id=${artwork.id}" class="artwork-item-link" target="_blank">View</a>
                    <button class="delete-btn" data-id="${artwork.id}">Delete</button>
                </div>
            </div>
        `;
        
        artworksList.appendChild(item);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const artworkId = this.getAttribute('data-id');
            deleteArtworkHandler(artworkId);
        });
    });
}

// Delete artwork handler
function deleteArtworkHandler(id) {
    if (confirm('Are you sure you want to delete this artwork?')) {
        const success = deleteArtwork(id);
        
        if (success) {
            showAlert('Artwork deleted successfully!', false);
            displayAdminArtworks(); // Refresh the list
        } else {
            showAlert('Could not delete artwork. It may be part of the initial collection.');
        }
    }
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

// Handle image upload and convert to Data URL
function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

// Setup image preview with file reader
function setupImagePreview() {
    if (!imageInput || !imagePreview || !previewImg) return;
    
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        
        if (file) {
            try {
                const dataUrl = await readImageAsDataURL(file);
                previewImg.src = dataUrl;
                imagePreview.style.display = 'block';
            } catch (error) {
                console.error('Error reading image:', error);
                showAlert('Error previewing image: ' + error.message);
                imagePreview.style.display = 'none';
            }
        } else {
            imagePreview.style.display = 'none';
        }
    });
}

// Handle form submission (saves to localStorage)
function setupFormSubmission() {
    if (!uploadForm) return;
    
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Get form values
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const medium = document.getElementById('medium').value || 'Mixed Media';
            const dimensions = document.getElementById('dimensions').value || '24" x 36"';
            const yearCreated = document.getElementById('yearCreated').value || new Date().getFullYear().toString();
            const artistName = document.getElementById('artistName').value || 'Jane Smith';
            const artistBio = document.getElementById('artistBio').value || 'Contemporary artist exploring various themes and mediums.';
            
            // Get the selected image file
            const imageFile = document.getElementById('image').files[0];
            
            if (!title || !description || !imageFile) {
                showAlert('Title, description, and image are required');
                return;
            }
            
            // Convert image to data URL
            const imageDataUrl = await readImageAsDataURL(imageFile);
            
            // Create a virtual filename - this won't be an actual file but a reference
            const timestamp = Date.now();
            const virtualFilename = `user-upload-${timestamp}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            // Create artwork data object
            const artworkData = {
                title,
                description,
                imageUrl: imageDataUrl, // Store the data URL directly
                createdByUser: Number(localStorage.getItem('userId')),
                medium,
                dimensions,
                yearCreated,
                artistName,
                artistBio
            };
            
            // Add artwork to localStorage database
            const newArtwork = addArtwork(artworkData);
            
            // Show success message
            showAlert(`Artwork "${title}" has been added successfully!`, false);
            
            // Reset form
            uploadForm.reset();
            imagePreview.style.display = 'none';
            
            // Refresh the artworks list
            displayAdminArtworks();
            
        } catch (error) {
            console.error('Error adding artwork:', error);
            showAlert('Error adding artwork: ' + error.message);
        }
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