// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const navActions = document.getElementById('nav-actions');
const loginForm = document.getElementById('login-form');
const loginAlert = document.getElementById('login-alert');
const uploadForm = document.getElementById('upload-form');
const uploadAlert = document.getElementById('upload-alert');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const artworksList = document.getElementById('artworks-list');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const userInfoContainer = document.getElementById('user-info');

// API endpoints
const API_BASE_URL = 'http://localhost:3000';
const AUTH_URL = `${API_BASE_URL}/api/auth/login`;
const ARTWORKS_URL = `${API_BASE_URL}/api/artworks`;
const USER_URL = `${API_BASE_URL}/api/user`;

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Get username
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

// Display alert message
function showAlert(element, message, isError = true) {
    element.textContent = message;
    element.className = isError ? 'alert alert-danger' : 'alert alert-success';
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Fetch user profile from API
async function fetchUserProfile() {
    try {
        const authToken = getAuthToken();
        
        if (!authToken) {
            return null;
        }
        
        const response = await fetch(USER_URL, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            // Unauthorized, token might be expired
            handleLogout();
            return null;
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch user profile');
        }
        
        return data.user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Display user profile
function displayUserProfile(userProfile) {
    if (!userProfile || !userInfoContainer) {
        return;
    }
    
    // User greeting
    const userGreeting = document.createElement('div');
    userGreeting.className = 'user-greeting';
    userGreeting.textContent = `Hello, ${userProfile.name}`;
    userInfoContainer.appendChild(userGreeting);
    
    // Display artworks added by user
    const artworksSection = document.createElement('div');
    artworksSection.className = 'artworks-section';
    artworksSection.innerHTML = `<h3>Your Artworks:</h3>`;
    
    if (!userProfile.artworks || userProfile.artworks.length === 0) {
        artworksSection.innerHTML += `<p>No artworks added yet!</p>`;
    } else {
        const artworksList = document.createElement('ul');
        
        userProfile.artworks.forEach(artwork => {
            const item = document.createElement('li');
            item.innerHTML = `
                <span>${artwork.title}</span>
                <a href="artwork.html?id=${artwork.id}" target="_blank">View</a>
            `;
            artworksList.appendChild(item);
        });
        
        artworksSection.appendChild(artworksList);
    }
    
    userInfoContainer.appendChild(artworksSection);
}

// Fetch user's artworks
async function fetchUserArtworks() {
    try {
        // Show loading indicator
        artworksList.innerHTML = '<div class="loading">Loading your artworks...</div>';
        
        const userProfile = await fetchUserProfile();
        
        if (!userProfile) {
            showAlert(uploadAlert, 'Failed to fetch user profile');
            return;
        }
        
        displayUserArtworks(userProfile.artworks || []);
    } catch (error) {
        console.error('Error fetching artworks:', error);
        showAlert(uploadAlert, 'Error fetching artworks');
        artworksList.innerHTML = '<div class="no-artworks">Could not load artworks</div>';
    }
}

// Display user's artworks
function displayUserArtworks(artworks) {
    // Clear container
    artworksList.innerHTML = '';
    
    // Display message if no artworks found
    if (artworks.length === 0) {
        artworksList.innerHTML = '<div class="no-artworks">You haven\'t uploaded any artworks yet</div>';
        return;
    }
    
    // Create and append artwork items
    artworks.forEach(artwork => {
        const item = document.createElement('div');
        item.className = 'artwork-item';
        
        item.innerHTML = `
            <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-item-image">
            <div class="artwork-item-info">
                <h3 class="artwork-item-title">${artwork.title}</h3>
                <a href="artwork.html?id=${artwork.id}" class="artwork-item-link" target="_blank">View Details</a>
            </div>
        `;
        
        artworksList.appendChild(item);
    });
}

// Handle artwork upload
async function uploadArtwork(formData) {
    try {
        const authToken = getAuthToken();
        
        if (!authToken) {
            showAlert(uploadAlert, 'You are not logged in');
            return false;
        }
        
        const response = await fetch(ARTWORKS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(uploadAlert, data.message || 'Artwork created successfully', false);
            uploadForm.reset();
            imagePreview.style.display = 'none';
            fetchUserArtworks();
            return true;
        } else {
            showAlert(uploadAlert, data.message || 'Failed to create artwork');
            return false;
        }
    } catch (error) {
        console.error('Error uploading artwork:', error);
        showAlert(uploadAlert, 'Error connecting to server. Please try again.');
        return false;
    }
}

// Initialize the app
async function init() {
    console.log('Initializing admin page...');
    
    if (!isLoggedIn()) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Only admins can access the admin page
    if (!isAdminUser()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Show dashboard
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (navActions) navActions.style.display = 'block';
    
    // Fetch and display user profile
    const userProfile = await fetchUserProfile();
    
    if (userProfile) {
        displayUserProfile(userProfile);
        fetchUserArtworks(); // Also fetch artworks
    } else {
        if (uploadAlert) showAlert(uploadAlert, 'Failed to load user profile');
    }
    
    // Upload form submit handler
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const medium = document.getElementById('medium').value;
            const dimensions = document.getElementById('dimensions').value;
            const yearCreated = document.getElementById('yearCreated').value;
            const artistName = document.getElementById('artistName').value;
            const artistBio = document.getElementById('artistBio').value;
            const image = imageInput.files[0];
            
            if (!title || !description || !image) {
                showAlert(uploadAlert, 'Title, description, and image are required');
                return;
            }
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('image', image);
            
            // Add optional fields if they have values
            if (medium) formData.append('medium', medium);
            if (dimensions) formData.append('dimensions', dimensions);
            if (yearCreated) formData.append('yearCreated', yearCreated);
            if (artistName) formData.append('artistName', artistName);
            if (artistBio) formData.append('artistBio', artistBio);
            
            await uploadArtwork(formData);
        });
    }
    
    // Image preview handler
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (file && previewImg && imagePreview) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            } else if (imagePreview) {
                imagePreview.style.display = 'none';
            }
        });
    }
    
    // Logout button handler
    if (logoutBtn) {
        console.log('Setting up logout button handler');
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.warn('Logout button not found in the DOM');
    }
    
    // Refresh button handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchUserArtworks);
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);