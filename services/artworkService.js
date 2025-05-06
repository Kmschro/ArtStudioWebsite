import { readJsonFile, writeJsonFile } from '../utils.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const ARTWORKS_FILE = path.join(dataDir, 'artworks.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure artworks file exists
if (!fs.existsSync(ARTWORKS_FILE)) {
    fs.writeFileSync(ARTWORKS_FILE, JSON.stringify([], null, 2));
}

/**
 * Get all artworks from the data store
 * @returns {Promise<Array>} - Array of Artwork objects
 */
export async function getAllArtworks() {
    try {
        const artworks = await readJsonFile(ARTWORKS_FILE);
        const { Artwork } = await import('../models/artwork.js');
        return artworks.map(artworkData => Artwork.fromObject(artworkData));
    } catch (error) {
        console.error('Error getting all artworks:', error);
        return [];
    }
}

/**
 * Get an artwork by ID
 * @param {number} id - The ID of the artwork to retrieve
 * @returns {Promise<Object|null>} - The artwork with the given ID, or null if not found
 */
export async function getArtworkById(id) {
    try {
        const artworks = await readJsonFile(ARTWORKS_FILE);
        const artworkData = artworks.find(artwork => artwork.id === Number(id));
        
        if (!artworkData) {
            return null;
        }
        
        const { Artwork } = await import('../models/artwork.js');
        return Artwork.fromObject(artworkData);
    } catch (error) {
        console.error(`Error getting artwork with ID ${id}:`, error);
        return null;
    }
}

/**
 * Create a new artwork
 * @param {Object} artworkData - Artwork data to create
 * @returns {Promise<{success: boolean, message: string, artwork: Object|null}>} - Result of the creation
 */
export async function createArtwork(artworkData) {
    try {
        // Get existing artworks
        const artworks = await readJsonFile(ARTWORKS_FILE);
        
        // Generate new ID (max ID + 1)
        const newId = artworks.length > 0
            ? Math.max(...artworks.map(artwork => artwork.id)) + 1
            : 1;
        
        // Import Artwork model
        const { Artwork } = await import('../models/artwork.js');
        
        // Create new artwork
        const newArtwork = new Artwork(
            newId,
            artworkData.title,
            artworkData.description,
            artworkData.imageUrl,
            artworkData.createdByUser,
            new Date().toISOString(),
            artworkData.medium,
            artworkData.dimensions,
            artworkData.yearCreated,
            artworkData.artistName,
            artworkData.artistBio
        );
        
        // Add to artworks array and save
        artworks.push(newArtwork.toObject());
        await writeJsonFile(ARTWORKS_FILE, artworks);
        
        return {
            success: true,
            message: `Artwork "${newArtwork.title}" created successfully with ID ${newArtwork.id}.`,
            artwork: newArtwork
        };
    } catch (error) {
        console.error('Error creating artwork:', error);
        return {
            success: false,
            message: 'An error occurred while creating the artwork',
            artwork: null
        };
    }
}

/**
 * Get all artworks created by a specific user
 * @param {number} userId - ID of the user
 * @returns {Promise<Array>} - Array of Artwork objects
 */
export async function getArtworksByUser(userId) {
    try {
        const artworks = await readJsonFile(ARTWORKS_FILE);
        const userArtworks = artworks.filter(artwork => artwork.createdByUser === Number(userId));
        const { Artwork } = await import('../models/artwork.js');
        return userArtworks.map(artworkData => Artwork.fromObject(artworkData));
    } catch (error) {
        console.error(`Error getting artworks for user ${userId}:`, error);
        return [];
    }
}