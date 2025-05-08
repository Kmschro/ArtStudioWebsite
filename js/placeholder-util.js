// Utility function for generating placeholder images
// This approach creates a simple SVG placeholder as a data URI
// This avoids relying on external services like placeholder.com

/**
 * Creates a data URI for a placeholder image with text
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Text to display on the placeholder
 * @returns {string} - Data URI for the placeholder image
 */
function createPlaceholder(width, height, text) {
    // Sanitize text to avoid breaking the SVG
    const sanitizedText = (text || 'Artwork')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    
    // Create a simple SVG with the provided dimensions and text
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect fill="#f2f2f2" width="${width}" height="${height}"/>
        <rect fill="#e0e0e0" x="0" y="0" width="${width}" height="${height}"/>
        <text fill="#888888" font-family="Arial,sans-serif" font-size="${Math.floor(width/20)}px" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${sanitizedText}</text>
    </svg>`;
    
    // Convert to a data URI
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Create placeholder based on size
const smallPlaceholder = createPlaceholder(150, 100, "Artwork");
const mediumPlaceholder = createPlaceholder(300, 200, "Artwork");
const largePlaceholder = createPlaceholder(800, 600, "Artwork");

// Create a placeholder with the artwork's title
function createTitledPlaceholder(width, height, title) {
    return createPlaceholder(width, height, title);
}