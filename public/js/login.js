// Configuration
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('login-alert');

// Clear previous authentication data
function checkAuthStatus() {
    // Clear all previous credentials to ensure fresh login
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    
    // Get form data
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate form fields
    if (!username || !password) {
        showAlert('Please enter both username and password.');
        return;
    }
    
    try {
        // Send login request to API
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showAlert(data.message || 'Login failed. Please check your credentials.');
            return;
        }
        
        // Save auth token and user info to local storage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', data.userId);
        
        // Redirect based on username
        if (username === 'admin') {
            // Admin user - redirect to admin page
            window.location.href = 'admin.html';
        } else {
            // Regular user - redirect to index page
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred during login. Please try again.');
    }
}

// Show error message
function showAlert(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Add form submit event listener
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
});