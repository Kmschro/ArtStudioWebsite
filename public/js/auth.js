// Auth-related DOM elements
const loginLink = document.getElementById('login-link');
const adminLink = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get username
function getUsername() {
    return localStorage.getItem('username');
}

// Check if user is admin
function isAdminUser() {
    return getUsername() === 'admin';
}

// Handle logout
function handleLogout() {
    // Remove auth token and user info from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Update UI based on authentication state
function updateAuthUI() {
    if (isLoggedIn()) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        // Show admin link if user is admin
        if (adminLink && isAdminUser()) {
            adminLink.style.display = 'inline-block';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Initialize auth UI
function initAuth() {
    // Update UI based on authentication state
    updateAuthUI();
    
    // Add event listener to logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);