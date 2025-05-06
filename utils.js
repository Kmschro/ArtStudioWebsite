import fs from 'fs/promises';

/**
 * Read JSON file and parse contents
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<any>} - Parsed JSON data
 */
export async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        throw error;
    }
}

/**
 * Write data to JSON file
 * @param {string} filePath - Path to JSON file
 * @param {any} data - Data to write to file
 * @returns {Promise<void>}
 */
export async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        throw error;
    }
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Path to directory
 * @returns {Promise<void>}
 */
export async function ensureDirectoryExists(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}