// API endpoints for images
const IMAGES_API_URL = 'http://localhost:5000/api/images';

// Handle image upload
const handleImageUpload = async (e) => {
    e.preventDefault();
    const spinner = app.showSpinner();

    try {
        const formData = new FormData(e.target);
        
        const response = await fetch(`${IMAGES_API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        app.showAlert('Image uploaded successfully!', 'success');
        e.target.reset();
        loadUserImages(); // Refresh the image gallery
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Load user's images
const loadUserImages = async () => {
    const spinner = app.showSpinner();
    const gallery = document.getElementById('userGallery');
    
    try {
        const response = await fetch(`${IMAGES_API_URL}/my-images`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load images');
        }

        gallery.innerHTML = data.length ? renderImageGrid(data) : '<p>No images uploaded yet.</p>';
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-image').forEach(button => {
            button.addEventListener('click', () => deleteImage(button.dataset.id));
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-image').forEach(button => {
            button.addEventListener('click', () => showEditModal(button.dataset.id));
        });
    } catch (error) {
        app.handleApiError(error);
        gallery.innerHTML = '<p>Error loading images. Please try again.</p>';
    } finally {
        app.hideSpinner(spinner);
    }
};

// Load public images
const loadPublicImages = async () => {
    const spinner = app.showSpinner();
    const gallery = document.getElementById('publicGallery');
    
    try {
        const response = await fetch(`${IMAGES_API_URL}/public`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load public images');
        }

        gallery.innerHTML = data.length ? renderImageGrid(data, true) : '<p>No public images available.</p>';
    } catch (error) {
        app.handleApiError(error);
        gallery.innerHTML = '<p>Error loading images. Please try again.</p>';
    } finally {
        app.hideSpinner(spinner);
    }
};

// Render image grid
const renderImageGrid = (images, isPublic = false) => {
    return images.map(image => `
        <div class="image-card" id="image-${image._id}">
            <img src="${image.path}" alt="${image.title}" onerror="this.src='/assets/images/default-image.png'">
            <div class="image-card-content">
                <h3 class="image-card-title">${image.title}</h3>
                <p>${image.description || ''}</p>
                ${image.tags && image.tags.length ? `<p class="tags">${image.tags.join(', ')}</p>` : ''}
                <p class="date">Uploaded on ${app.formatDate(image.createdAt)}</p>
                ${isPublic ? `
                    <p class="author">By ${image.user.username}</p>
                ` : `
                    <div class="image-actions">
                        <button class="btn btn-secondary edit-image" data-id="${image._id}">Edit</button>
                        <button class="btn btn-danger delete-image" data-id="${image._id}">Delete</button>
                    </div>
                `}
            </div>
        </div>
    `).join('');
};

// Delete image
const deleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    const spinner = app.showSpinner();

    try {
        const response = await fetch(`${IMAGES_API_URL}/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete image');
        }

        document.getElementById(`image-${imageId}`).remove();
        app.showAlert('Image deleted successfully', 'success');
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Update image
const updateImage = async (imageId, formData) => {
    const spinner = app.showSpinner();

    try {
        // Convert form data to JSON object
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            isPublic: formData.get('isPublic') === 'on', // Convert checkbox value to boolean
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
        };

        const response = await fetch(`${IMAGES_API_URL}/${imageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const updatedImage = await response.json();

        if (!response.ok) {
            throw new Error(updatedImage.message || 'Failed to update image');
        }

        // Update the image card in the UI
        const imageCard = document.getElementById(`image-${imageId}`);
        if (imageCard) {
            const updatedHtml = renderImageGrid([updatedImage]).trim();
            imageCard.outerHTML = updatedHtml;
        }

        // Refresh public gallery if we're on that page
        const publicGallery = document.getElementById('publicGallery');
        if (publicGallery) {
            loadPublicImages();
        }

        app.showAlert('Image updated successfully', 'success');
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Show edit modal
const showEditModal = async (imageId) => {
    const spinner = app.showSpinner();

    try {
        // Fetch current image data
        const response = await fetch(`${IMAGES_API_URL}/${imageId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image data');
        }

        const image = await response.json();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Image</h2>
                <form id="editImageForm">
                    <div class="form-group">
                        <label for="editTitle">Title</label>
                        <input type="text" id="editTitle" name="title" class="form-input" value="${image.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="editDescription">Description</label>
                        <textarea id="editDescription" name="description" class="form-input">${image.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editTags">Tags (comma-separated)</label>
                        <input type="text" id="editTags" name="tags" class="form-input" value="${image.tags ? image.tags.join(', ') : ''}">
                    </div>
                    <div class="form-group visibility-group">
                        <label class="visibility-label">
                            <input type="checkbox" id="editIsPublic" name="isPublic" ${image.isPublic ? 'checked' : ''}>
                            <span class="visibility-text">Share in Public Gallery</span>
                            <small class="visibility-help">Check this to make your image visible to everyone in the Public Gallery</small>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add submit handler
        document.getElementById('editImageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            updateImage(imageId, new FormData(e.target));
            modal.remove();
        });
    } catch (error) {
        app.handleApiError(error);
    } finally {
        app.hideSpinner(spinner);
    }
};

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const userGallery = document.getElementById('userGallery');
    const publicGallery = document.getElementById('publicGallery');

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleImageUpload);
    }

    if (userGallery) {
        loadUserImages();
    }

    if (publicGallery) {
        loadPublicImages();
    }
});
