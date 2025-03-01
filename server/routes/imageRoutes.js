const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const image = new Image({
            title: req.body.title || 'Untitled',
            description: req.body.description,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            user: req.userId,
            isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        });

        await image.save();
        res.status(201).json(image);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's images
router.get('/my-images', auth, async (req, res) => {
    try {
        const images = await Image.find({ user: req.userId })
            .sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get public images
router.get('/public', async (req, res) => {
    try {
        const images = await Image.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .populate('user', 'username');
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single image
router.get('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findOne({ _id: req.params.id, user: req.userId });
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update image
router.patch('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findOne({ _id: req.params.id, user: req.userId });
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'isPublic', 'tags'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        // Handle special cases
        if ('isPublic' in req.body) {
            image.isPublic = req.body.isPublic === true || req.body.isPublic === 'true';
        }
        if ('tags' in req.body && Array.isArray(req.body.tags)) {
            image.tags = req.body.tags;
        }
        if ('title' in req.body) {
            image.title = req.body.title;
        }
        if ('description' in req.body) {
            image.description = req.body.description;
        }

        await image.save();
        res.json(image);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findOne({ _id: req.params.id, user: req.userId });
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete file from uploads directory
        const filePath = path.join(__dirname, '..', image.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.remove();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
