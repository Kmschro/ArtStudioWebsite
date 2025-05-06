import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { readJsonFile } from '../utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const USERS_FILE = path.join(dataDir, 'users.json');

// JWT secret key (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'art_portfolio_secret_key_2025';
const TOKEN_EXPIRY = '24h';

/**
 * Hash password using SHA-256
 * @param {string} input - String to hash
 * @returns {string} - Hashed string
 */
function generateHash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Authenticate user by checking credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{token: string|null, userId: number|null}>} - JWT token if authorized, null otherwise
 */
export async function authenticate(username, password) {
    try {
        console.log('Attempting to authenticate:', username);
        
        // Read users from file
        const users = await readJsonFile(USERS_FILE);
        
        let user = null;
        
        // Map the usernames to user IDs
        if (username === 'admin') {
            user = users.find(u => u.id === 1);
        } else if (username === 'user') {
            user = users.find(u => u.id === 2);
        }
        
        // User not found
        if (!user) {
            console.log('User not found:', username);
            return { token: null, userId: null };
        }
        
        // Generate hash for username:password format
        const inputString = `${username}:${password}`;
        const calculatedHash = generateHash(inputString);
        
        console.log('User found:', user.name);
        console.log('Calculated hash:', calculatedHash);
        
        // Check if hash matches
        if (calculatedHash !== user.hash) {
            console.log('Hash mismatch for user:', username);
            return { token: null, userId: null };
        }
        
        // Generate JWT token
        const isAdminUser = user.id === 1;
        
        const token = jwt.sign(
            { 
                userId: user.id, 
                role: isAdminUser ? 'admin' : 'user',
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        
        console.log('Authentication successful for:', username);
        return { token, userId: user.id };
    } catch (error) {
        console.error('Authentication error:', error);
        return { token: null, userId: null };
    }
}

/**
 * Get user ID from token
 * @param {string} token - JWT token
 * @returns {number|null} - User ID if valid, null otherwise
 */
export function getUserIdFromToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * Check if user has admin role
 * @param {string} token - JWT token
 * @returns {boolean} - True if user is admin, false otherwise
 */
export function isAdmin(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'admin';
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

/**
 * Get user info from token
 * @param {string} token - JWT token
 * @returns {Object|null} - User info if valid, null otherwise
 */
export function getUserInfoFromToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            userId: decoded.userId,
            name: decoded.name,
            role: decoded.role
        };
    } catch (error) {
        console.error('Token info error:', error);
        return null;
    }
}