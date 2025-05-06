import { readJsonFile } from '../utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const USERS_FILE = path.join(dataDir, 'users.json');
const ARTWORKS_FILE = path.join(dataDir, 'artworks.json');

/**
 * Get a user by ID
 * @param {number} id - The ID of the user to retrieve
 * @returns {Promise<Object|null>} - The user with the given ID, or null if not found
 */
export async function getUserById(id) {
  try {
    const users = await readJsonFile(USERS_FILE);
    const userData = users.find(user => user.id === id);
    
    if (!userData) {
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error(`Error getting user with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get artworks created by a specific user
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array>} - Array of artworks created by the user
 */
export async function getArtworksByUser(userId) {
  try {
    const artworks = await readJsonFile(ARTWORKS_FILE);
    return artworks.filter(artwork => artwork.createdByUser === userId);
  } catch (error) {
    console.error(`Error getting artworks for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get user information including created artworks
 * @param {number} userId - The ID of the user
 * @returns {Promise<Object|null>} - User information or null if user not found
 */
export async function getUserInfo(userId) {
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return null;
    }
    
    const userArtworks = await getArtworksByUser(userId);
    
    // Create simplified artwork objects with just id and title
    const simplifiedArtworks = userArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      imageUrl: artwork.imageUrl
    }));
    
    return {
      id: user.id,
      name: user.name,
      artworks: simplifiedArtworks
    };
  } catch (error) {
    console.error(`Error getting user info for user ${userId}:`, error);
    return null;
  }
}