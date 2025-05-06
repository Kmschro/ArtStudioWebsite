// Static authentication for GitHub Pages version

// DOM Elements
const loginLink = document.getElementById('login-link');
const adminLink = document.getElementById('admin-link');
const logoutBtn = document.getElementById('logout-btn');

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
}

// Get username from localStorage
function getUsername() {
    return localStorage.getItem('username');
}

// Check if user is admin
function isAdminUser() {
    return getUsername() === 'admin';
}

// Handle logout
function handleLogout() {
    console.log('Logging out...');
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

// Static login handler for the login form
function handleStaticLogin(username, password) {
    // Find user in static data
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Create a "token" (just for simulation)
        const token = `static-token-${user.id}-${Date.now()}`;
        
        // Store auth data in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', user.username);
        localStorage.setItem('userId', user.id);
        
        // Redirect based on user type
        if (user.username === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
        
        return true;
    }
    
    return false;
}

// Initialize auth UI
function initAuth() {
    // Update UI based on authentication state
    updateAuthUI();
    
    // Add event listener to logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Handle login
            const success = handleStaticLogin(username, password);
            
            // Show error if login failed
            if (!success) {
                const loginAlert = document.getElementById('login-alert');
                if (loginAlert) {
                    loginAlert.textContent = 'Invalid username or password';
                    loginAlert.style.display = 'block';
                }
            }
        });
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);