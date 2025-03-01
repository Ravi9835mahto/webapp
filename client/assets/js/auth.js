// Handle login form submission
const handleLogin = async (e) => {
    e.preventDefault();
    const spinner = app.showSpinner();

    try {
        const response = await fetch(`${app.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to profile page
        window.location.href = '/profile.html';
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Handle signup form submission
const handleSignup = async (e) => {
    e.preventDefault();
    const spinner = app.showSpinner();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        app.showAlert('Passwords do not match');
        app.hideSpinner(spinner);
        return;
    }

    try {
        const response = await fetch(`${app.API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show success message and redirect
        app.showAlert('Registration successful!', 'success');
        setTimeout(() => {
            window.location.href = '/profile.html';
        }, 1500);
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Update profile
const updateProfile = async (e) => {
    e.preventDefault();
    const spinner = app.showSpinner();

    try {
        const formData = new FormData(e.target);
        const response = await fetch(`${app.API_URL}/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        // Update stored user data
        localStorage.setItem('user', JSON.stringify(data.user));
        app.showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Load profile data
const loadProfile = async () => {
    const spinner = app.showSpinner();

    try {
        const response = await fetch(`${app.API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load profile');
        }

        // Populate form fields
        document.getElementById('username').value = data.user.username;
        document.getElementById('email').value = data.user.email;
        document.getElementById('bio').value = data.user.bio || '';
        
        if (data.user.profilePicture) {
            document.getElementById('profilePicture').src = data.user.profilePicture;
        }
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const profileForm = document.getElementById('profileForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
        loadProfile();
    }
});
