import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { getUserIdFromToken, authenticate, isAdmin } from './services/authService.js';
import { getAllArtworks, getArtworkById, createArtwork } from './services/artworkService.js';
import { getUserInfo } from './services/userService.js';

// Load environment variables
dotenv.config();

// Setup file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static files from:', path.join(__dirname, 'public'));

// Set up image uploads directory
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
    
    req.userId = userId;
    req.isAdmin = isAdmin(token);
    next();
}

// API Routes

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        // Validate request body
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        // Authenticate user
        const result = await authenticate(username, password);
        
        if (!result.token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Authentication successful', 
            token: result.token, 
            userId: result.userId 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
        });
    }
});

// Get all artworks
app.get('/api/artworks', async (req, res) => {
    try {
        const artworks = await getAllArtworks();
        res.json({ success: true, artworks });
    } catch (error) {
        console.error('Error getting artworks:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching artworks' 
        });
    }
});

// Get artwork by ID
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        if (isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID must be a valid number' 
            });
        }
        
        const artwork = await getArtworkById(id);
        
        if (!artwork) {
            return res.status(404).json({ 
                success: false, 
                message: `Artwork with ID ${id} not found` 
            });
        }
        
        res.json({ success: true, artwork });
    } catch (error) {
        console.error(`Error getting artwork with ID ${req.params.id}:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching artwork' 
        });
    }
});

// Create new artwork (protected route)
app.post('/api/artworks', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            medium, 
            dimensions, 
            yearCreated,
            artistName,
            artistBio
        } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image file is required' 
            });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        console.log('New image saved at:', imageUrl);
        
        const artworkData = {
            title,
            description,
            imageUrl,
            createdByUser: req.userId,
            medium,
            dimensions,
            yearCreated,
            artistName,
            artistBio
        };
        
        // Validate artwork data
        if (!title || !description) {
            // Remove uploaded file if validation fails
            fs.unlinkSync(path.join(__dirname, 'public', imageUrl));
            
            return res.status(400).json({ 
                success: false, 
                message: 'Title and description are required' 
            });
        }
        
        const result = await createArtwork(artworkData);
        
        if (!result.success) {
            // Remove uploaded file if creation fails
            fs.unlinkSync(path.join(__dirname, 'public', imageUrl));
            
            return res.status(500).json({ 
                success: false, 
                message: result.message || 'Failed to create artwork' 
            });
        }
        
        res.status(201).json({
            success: true,
            message: `Artwork "${result.artwork.title}" created successfully with ID ${result.artwork.id}.`,
            artwork: result.artwork
        });
    } catch (error) {
        console.error('Error creating artwork:', error);
        
        // If there was a file uploaded, try to remove it
        if (req.file) {
            try {
                fs.unlinkSync(path.join(__dirname, 'public', `/uploads/${req.file.filename}`));
            } catch (unlinkError) {
                console.error('Error removing uploaded file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating artwork' 
        });
    }
});

// Get user information (protected route)
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const userInfo = await getUserInfo(req.userId);
        
        if (!userInfo) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({ 
            success: true, 
            user: userInfo 
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching user information' 
        });
    }
});

// Serve the public-facing portfolio site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin interface
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve the artwork detail page
app.get('/artwork', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'artwork.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Catch-all route for undefined endpoints
app.all('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the site at: http://localhost:${PORT}`);
});