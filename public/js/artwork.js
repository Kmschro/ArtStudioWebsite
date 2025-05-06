// DOM Elements
const artworkDetail = document.getElementById('artwork-detail');

// API endpoint - Make sure this points to your Express server
const API_URL = 'http://localhost:3000/api/artworks';

// Get artwork ID from URL query parameter
function getArtworkId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch artwork by ID
async function fetchArtworkById(id) {
    try {
        console.log('Fetching artwork with ID:', id);
        const response = await fetch(`${API_URL}/${id}`);
        
        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error('Failed to fetch artwork');
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success && data.artwork) {
            return data.artwork;
        } else {
            console.error('Invalid response format or artwork not found', data);
            throw new Error('Invalid response format or artwork not found');
        }
    } catch (error) {
        console.error('Error fetching artwork:', error);
        return null;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Display artwork details
function displayArtworkDetails(artwork) {
    console.log('Displaying artwork details:', artwork);
    
    // Create artwork detail HTML
    const html = `
        <div class="artwork-header">
            <h1>${artwork.title}</h1>
            <div class="artwork-date">Added on ${formatDate(artwork.createdAt)}</div>
        </div>
        <div class="artwork-content">
            <div class="artwork-image-container">
                <img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image">
            </div>
            <div class="artwork-info">
                <div class="artwork-description">
                    ${artwork.description}
                </div>
                <div class="artwork-metadata">
                    <div class="metadata-item">
                        <span class="metadata-label">Artist</span>
                        <span class="metadata-value">${artwork.artistName || 'Jane Smith'}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Date Created</span>
                        <span class="metadata-value">${artwork.yearCreated || '2024'}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Medium</span>
                        <span class="metadata-value">${artwork.medium || 'Acrylic on canvas'}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Dimensions</span>
                        <span class="metadata-value">${artwork.dimensions || '24" x 36"'}</span>
                    </div>
                </div>
                
                <div class="additional-details">
                    <h2>About the Artist</h2>
                    <p>${artwork.artistBio || 'Jane Smith is a contemporary artist based in New York. She specializes in abstract expressionism and mixed media artworks.'}</p>
                </div>
                
                <div class="social-share">
                    <a href="javascript:void(0)" onclick="shareOnSocialMedia('facebook')" class="share-button">Share on Facebook</a>
                    <a href="javascript:void(0)" onclick="shareOnSocialMedia('twitter')" class="share-button">Share on Twitter</a>
                    <a href="javascript:void(0)" onclick="shareOnSocialMedia('pinterest')" class="share-button">Share on Pinterest</a>
                </div>
                
                <a href="index.html" class="back-to-gallery">← Back to Gallery</a>
            </div>
        </div>
    `;
    
    // Update artwork detail container
    artworkDetail.innerHTML = html;
    
    // Update page title
    document.title = `${artwork.title} - Art Portfolio`;
}

// Share on social media (placeholder function)
function shareOnSocialMedia(platform) {
    const url = window.location.href;
    const title = document.title;
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'pinterest':
            const imageUrl = document.querySelector('.artwork-image').src;
            shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(window.location.origin + imageUrl)}&description=${encodeURIComponent(title)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Add the social media sharing function to window object so it can be called from inline event handlers
window.shareOnSocialMedia = shareOnSocialMedia;

// Display error message
function displayError(message) {
    artworkDetail.innerHTML = `
        <div class="artwork-header">
            <h1>Error</h1>
        </div>
        <div class="artwork-content">
            <div class="error-message">
                <p>${message}</p>
                <a href="index.html" class="back-to-gallery">← Back to Gallery</a>
            </div>
        </div>
    `;
}

// Initialize the page
async function init() {
    const artworkId = getArtworkId();
    
    if (!artworkId) {
        displayError('No artwork ID provided');
        return;
    }
    
    console.log('Starting initialization with ID:', artworkId);
    const artwork = await fetchArtworkById(artworkId);
    
    if (artwork) {
        displayArtworkDetails(artwork);
    } else {
        displayError('Artwork not found or could not be loaded');
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);