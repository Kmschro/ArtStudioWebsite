export class Artwork {
    /**
     * Create a new Artwork instance
     * @param {number} id - Unique identifier for the artwork
     * @param {string} title - Title of the artwork
     * @param {string} description - Description/blurb about the artwork
     * @param {string} imageUrl - URL to the image of the artwork
     * @param {number} createdByUser - ID of the user who created this artwork entry
     * @param {string} createdAt - ISO date string of when the artwork was created
     * @param {string} medium - Medium used for the artwork (e.g., "Oil on canvas")
     * @param {string} dimensions - Dimensions of the artwork (e.g., "24\" x 36\"")
     * @param {string} yearCreated - Year the artwork was created
     * @param {string} artistName - Name of the artist
     * @param {string} artistBio - Short biography of the artist
     */
    constructor(id, title, description, imageUrl, createdByUser, createdAt, 
                medium, dimensions, yearCreated, artistName, artistBio) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.createdByUser = createdByUser;
        this.createdAt = createdAt || new Date().toISOString();
        
        // Additional details (defaults provided for backward compatibility)
        this.medium = medium || "Mixed media";
        this.dimensions = dimensions || "Various dimensions";
        this.yearCreated = yearCreated || new Date().getFullYear().toString();
        this.artistName = artistName || "Jane Smith";
        this.artistBio = artistBio || "Contemporary artist specializing in various mediums and styles.";
    }

    /**
     * Create an Artwork instance from plain object
     * @param {Object} data - Plain object with artwork data
     * @returns {Artwork} - New Artwork instance
     */
    static fromObject(data) {
        return new Artwork(
            data.id,
            data.title,
            data.description,
            data.imageUrl,
            data.createdByUser,
            data.createdAt,
            data.medium,
            data.dimensions,
            data.yearCreated,
            data.artistName,
            data.artistBio
        );
    }

    /**
     * Convert Artwork instance to plain object
     * @returns {Object} - Plain object representation of the artwork
     */
    toObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            imageUrl: this.imageUrl,
            createdByUser: this.createdByUser,
            createdAt: this.createdAt,
            medium: this.medium,
            dimensions: this.dimensions,
            yearCreated: this.yearCreated,
            artistName: this.artistName,
            artistBio: this.artistBio
        };
    }

    /**
     * Validate artwork data before creation
     * @param {Object} data - Artwork data to validate
     * @returns {string|null} - Error message if invalid, null if valid
     */
    static validate(data) {
        // Check title
        if (!data.title || data.title.trim().length === 0) {
            return "Title is required";
        }

        // Check description
        if (!data.description || data.description.trim().length === 0) {
            return "Description is required";
        }

        // Check image URL
        if (!data.imageUrl || data.imageUrl.trim().length === 0) {
            return "Image URL is required";
        }

        // Check user ID
        if (!data.createdByUser) {
            return "User ID is required";
        }

        return null; // No validation errors
    }
}