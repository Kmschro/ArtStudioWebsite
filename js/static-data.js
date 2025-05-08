// Static artwork data for GitHub Pages version
const INITIAL_ARTWORKS = [
    {
        id: 1,
        title: "Sunset Reflections",
        description: "A vibrant impressionist landscape capturing the warm glow of a summer sunset over a tranquil lake. The interplay of light and water creates a symphony of colors, from deep purples to fiery oranges and soft pinks.",
        imageUrl: "/uploads/Hillside.jpg",
        createdByUser: 1,
        createdAt: "2024-01-15T14:22:56.789Z",
        medium: "Oil on canvas",
        dimensions: "24\" x 36\"",
        yearCreated: "2023",
        artistName: "Jane Smith",
        artistBio: "Jane Smith is a contemporary landscape artist known for her expressive brushwork and vibrant color palette. Inspired by the natural world, her work explores the emotional impact of light and atmosphere in natural settings."
    },
    {
        id: 2,
        title: "Urban Fragments",
        description: "This mixed media piece explores the layered experience of city life through a collage of architectural elements, text, and abstract forms. The fragmented composition reflects the chaotic yet structured nature of urban environments.",
        imageUrl: "/uploads/weirdPainting.jpg",
        createdByUser: 1,
        createdAt: "2024-02-10T09:15:30.123Z",
        medium: "Mixed media on wood panel",
        dimensions: "30\" x 40\"",
        yearCreated: "2024",
        artistName: "Jane Smith",
        artistBio: "Jane Smith is a contemporary landscape artist known for her expressive brushwork and vibrant color palette. Inspired by the natural world, her work explores the emotional impact of light and atmosphere in natural settings."
    },
    {
        id: 3,
        title: "Whispers of Memory",
        description: "This abstract expressionist painting explores themes of memory and emotion through gestural brushstrokes and a muted color palette. Layers of paint are built up and scraped away to reveal glimpses of previous marks, mirroring how memories are both preserved and altered over time.",
        imageUrl: "/uploads/flowers.jpg",
        createdByUser: 1,
        createdAt: "2024-03-05T16:40:22.456Z",
        medium: "Acrylic and oil pastel on canvas",
        dimensions: "36\" x 48\"",
        yearCreated: "2023",
        artistName: "Jane Smith",
        artistBio: "Jane Smith is a contemporary landscape artist known for her expressive brushwork and vibrant color palette. Inspired by the natural world, her work explores the emotional impact of light and atmosphere in natural settings."
    },
    {
        id: 4,
        title: "Botanical Studies: Spring Collection",
        description: "A series of detailed watercolor studies of spring flora from the artist's garden. Each specimen is rendered with botanical accuracy while maintaining a loose, expressive quality in the brushwork. The collection celebrates the delicate beauty and ephemeral nature of spring blossoms.",
        imageUrl: "/uploads/colorfulOwlPainting.jpg",
        createdByUser: 1,
        createdAt: "2024-04-12T11:30:45.789Z",
        medium: "Watercolor on cotton paper",
        dimensions: "12\" x 16\" (each)",
        yearCreated: "2024",
        artistName: "Jane Smith",
        artistBio: "Jane Smith is a contemporary landscape artist known for her expressive brushwork and vibrant color palette. Inspired by the natural world, her work explores the emotional impact of light and atmosphere in natural settings."
    },
    {
        id: 5,
        title: "Contemplation in Blue",
        description: "This figurative painting depicts a solitary figure in a moment of quiet introspection. Rendered primarily in shades of blue and complementary amber tones, the composition uses negative space and simplified forms to create a sense of emotional resonance and psychological depth.",
        imageUrl: "/uploads/oilFlowers.png",
        createdByUser: 1,
        createdAt: "2024-04-25T14:20:10.123Z",
        medium: "Oil on linen",
        dimensions: "32\" x 48\"",
        yearCreated: "2023",
        artistName: "Jane Smith",
        artistBio: "Jane Smith is a contemporary landscape artist known for her expressive brushwork and vibrant color palette. Inspired by the natural world, her work explores the emotional impact of light and atmosphere in natural settings."
    }
];

// Static authentication data
const USERS = [
    {
        id: 1,
        name: "Administrator",
        username: "admin",
        password: "admin" // Note: In a real app, you'd never store passwords in plain text
    },
    {
        id: 2,
        name: "Regular User",
        username: "user",
        password: "password123" // Note: In a real app, you'd never store passwords in plain text
    }
];

// Setup local storage for user-added artworks
function setupLocalArtworks() {
    // Check if we already have user artworks in localStorage
    if (!localStorage.getItem('userArtworks')) {
        localStorage.setItem('userArtworks', JSON.stringify([]));
    }
}

// Get all artworks (initial + user added)
function getAllArtworks() {
    // Initialize local storage if needed
    setupLocalArtworks();
    
    // Get user-added artworks from localStorage
    const userArtworks = JSON.parse(localStorage.getItem('userArtworks') || '[]');
    
    // Combine initial artworks with user-added ones
    return [...INITIAL_ARTWORKS, ...userArtworks];
}

// Add new artwork to localStorage
function addArtwork(artworkData) {
    // Initialize local storage if needed
    setupLocalArtworks();
    
    // Get existing user artworks
    const userArtworks = JSON.parse(localStorage.getItem('userArtworks') || '[]');
    
    // Generate a new ID (max ID + 1)
    const allArtworks = getAllArtworks();
    const nextId = allArtworks.length > 0 
        ? Math.max(...allArtworks.map(a => a.id)) + 1 
        : 1;
    
    // Create new artwork object
    const newArtwork = {
        ...artworkData,
        id: nextId,
        createdAt: new Date().toISOString()
    };
    
    // Add to user artworks
    userArtworks.push(newArtwork);
    
    // Save back to localStorage
    localStorage.setItem('userArtworks', JSON.stringify(userArtworks));
    
    return newArtwork;
}

// Get artwork by ID
function getArtworkById(id) {
    return getAllArtworks().find(artwork => artwork.id.toString() === id.toString());
}

// Delete artwork by ID (only works for user-added artworks)
function deleteArtwork(id) {
    // Get user-added artworks
    const userArtworks = JSON.parse(localStorage.getItem('userArtworks') || '[]');
    
    // Check if this ID exists in user artworks
    const index = userArtworks.findIndex(artwork => artwork.id.toString() === id.toString());
    
    if (index !== -1) {
        // Remove from array
        userArtworks.splice(index, 1);
        
        // Save back to localStorage
        localStorage.setItem('userArtworks', JSON.stringify(userArtworks));
        return true;
    }
    
    return false;
}

// Get artworks for the current user
function getCurrentUserArtworks() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    
    return getAllArtworks().filter(artwork => 
        artwork.createdByUser.toString() === userId.toString()
    );
}

// Make artworks available globally
const ARTWORKS = getAllArtworks();