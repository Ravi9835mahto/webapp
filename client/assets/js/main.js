// API endpoints
const API_URL = 'http://localhost:5000/api/auth';

// Utility functions
const showAlert = (message, type = 'error') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => alertDiv.remove(), 5000);
};

const showSpinner = () => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    document.querySelector('.container').appendChild(spinner);
    return spinner;
};

const hideSpinner = (spinner) => {
    if (spinner) spinner.remove();
};

// Authentication check
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const publicPages = ['/', '/index.html', '/login.html', '/signup.html', '/public.html'];
    const currentPath = window.location.pathname;

    if (!token && !publicPages.includes(currentPath)) {
        window.location.href = '/login.html';
        return false;
    }

    if (token) {
        // Verify token is valid
        fetch(`${API_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(() => {
            // If token verification fails, clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!publicPages.includes(currentPath)) {
                window.location.href = '/login.html';
            }
        });
    }

    updateNavigation();
    return true;
};

// Update navigation based on auth status
const updateNavigation = () => {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const token = localStorage.getItem('token');
    if (token) {
        nav.innerHTML = `
            <li><a href="/profile.html">Profile</a></li>
            <li><a href="/public.html">Public Gallery</a></li>
            <li><a href="#" id="logout">Logout</a></li>
        `;
        document.getElementById('logout').addEventListener('click', logout);
    } else {
        nav.innerHTML = `
            <li><a href="/login.html">Login</a></li>
            <li><a href="/signup.html">Sign Up</a></li>
            <li><a href="/public.html">Public Gallery</a></li>
        `;
    }
};

// Logout function
const logout = (e) => {
    e && e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
};

// Format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Handle API errors
const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.message.includes('Please authenticate')) {
        logout();
    } else {
        showAlert(error.message || 'An error occurred. Please try again.');
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    if (!checkAuth()) return;
    
    // Add event listener for logout button if it exists
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Export functions for use in other scripts
window.app = {
    API_URL,
    showAlert,
    showSpinner,
    hideSpinner,
    checkAuth,
    updateNavigation,
    formatDate,
    handleApiError
};
