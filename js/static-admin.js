// Enhanced admin page for GitHub Pages
// This version allows admins to export code to update static-data.js

// DOM Elements
const artworksList = document.getElementById('artworks-list');
const uploadForm = document.getElementById('upload-form');
const uploadAlert = document.getElementById('upload-alert');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const codeDisplayArea = document.getElementById('code-display');
const imageLinkArea = document.getElementById('image-link');

// Simple placeholder function if not defined elsewhere
function createBasicPlaceholder(text) {
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100">
            <rect fill="#f2f2f2" width="150" height="100"/>
            <text fill="#888888" font-family="Arial,sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${text || 'Artwork'}</text>
        </svg>`
    );
}

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
        // Use the image URL directly - it can be a path or a data URL
        let artworkImageUrl = artwork.imageUrl;
        
        // Only fix path if it's a relative path, not a data URL
        if (artworkImageUrl && !artworkImageUrl.startsWith('data:') && window.location.hostname.endsWith('github.io')) {
            // Convert relative paths to GitHub Pages format
            artworkImageUrl = artworkImageUrl.startsWith('/') ? 
                `${window.location.pathname}${artworkImageUrl.substring(1)}` : 
                artworkImageUrl;
        }
        
        const item = document.createElement('div');
        item.className = 'artwork-item';
        
        const placeholderSrc = typeof createTitledPlaceholder === 'function' ? 
            createTitledPlaceholder(150, 100, artwork.title) : 
            createBasicPlaceholder(artwork.title);
        
        item.innerHTML = `
            <img src="${artworkImageUrl}" alt="${artwork.title}" class="artwork-item-image" onerror="this.src='${placeholderSrc}'">
            <div class="artwork-item-info">
                <h3 class="artwork-item-title">${artwork.title}</h3>
                <div class="artwork-item-actions">
                    <a href="artwork.html?id=${artwork.id}" class="artwork-item-link" target="_blank">View</a>
                </div>
            </div>
        `;
        
        artworksList.appendChild(item);
    });
}

// Generate code for adding to static-data.js
function generateCodeForArtwork(artwork) {
    if (!artwork) {
        showAlert('Artwork not found');
        return;
    }
    
    // Clear previous code
    if (codeDisplayArea) {
        codeDisplayArea.innerHTML = '';
    }
    
    // Generate a filename for the image
    const sanitizedTitle = artwork.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    const filename = `${sanitizedTitle}.jpg`;
    const imagePath = `./uploads/${filename}`;
    
    // Create a card to display the code
    const codeCard = document.createElement('div');
    codeCard.className = 'admin-card code-export-card';
    
    // Create code snippet for static-data.js
    const codeSnippet = `
// Add this to your INITIAL_ARTWORKS array in static-data.js
{
    id: ${getNextArtworkId()},
    title: "${escapeJsString(artwork.title)}",
    description: "${escapeJsString(artwork.description)}",
    imageUrl: "${imagePath}",
    createdByUser: ${artwork.createdByUser},
    createdAt: "${new Date().toISOString()}",
    medium: "${escapeJsString(artwork.medium || '')}",
    dimensions: "${escapeJsString(artwork.dimensions || '')}",
    yearCreated: "${escapeJsString(artwork.yearCreated || '')}",
    artistName: "${escapeJsString(artwork.artistName || '')}",
    artistBio: "${escapeJsString(artwork.artistBio || '')}"
}
`;
    
    codeCard.innerHTML = `
        <h2>Generated Code</h2>
        <p>Follow these steps to add this artwork permanently:</p>
        <ol>
            <li>Download the image using the button below</li>
            <li>Save the image to your project's "uploads" folder as "${filename}"</li>
            <li>Copy the code below and add it to your static-data.js file</li>
            <li>Update your repository on GitHub</li>
        </ol>
        <div class="code-section">
            <pre><code>${escapeHtml(codeSnippet)}</code></pre>
            <button class="btn copy-btn">Copy Code</button>
        </div>
        <div class="image-download-section">
            <h3>Download Image</h3>
            <div id="image-preview-export">
                <img src="${artwork.imageUrl}" alt="${artwork.title}" style="max-width:300px; max-height:200px;">
            </div>
            <a id="download-link" class="btn download-btn" download="${filename}">Download Image</a>
        </div>
    `;
    
    // Add the code card to the display area
    if (codeDisplayArea) {
        codeDisplayArea.appendChild(codeCard);
        
        // Set up download link
        if (artwork.imageUrl.startsWith('data:')) {
            const downloadLink = codeCard.querySelector('#download-link');
            if (downloadLink) {
                downloadLink.href = artwork.imageUrl;
            }
        }
        
        // Set up copy button
        const copyBtn = codeCard.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(codeSnippet)
                    .then(() => {
                        showAlert('Code copied to clipboard!', false);
                    })
                    .catch(err => {
                        console.error('Error copying code:', err);
                        showAlert('Failed to copy code. Please select and copy manually.');
                    });
            });
        }
    }
    
    // Scroll to the code
    if (codeDisplayArea) {
        codeDisplayArea.scrollIntoView({ behavior: 'smooth' });
    }
}

// Get next ID for a new artwork
function getNextArtworkId() {
    const allArtworks = getAllArtworks();
    return allArtworks.length > 0 ? Math.max(...allArtworks.map(a => a.id)) + 1 : 1;
}

// Escape HTML entities
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Escape strings for JavaScript
function escapeJsString(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
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
            
            // Automatically generate code for this artwork
            if (newArtwork) {
                setTimeout(() => {
                    generateCodeForArtwork(newArtwork);
                }, 500);
            }
            
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