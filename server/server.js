const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");

require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes - These should come BEFORE static file serving
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// Serve static files from the 'client' folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
connectDB();

// Routes for HTML Pages - These should come AFTER API routes
app.get(["/", "/index.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.get(["/signup", "/signup.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "../client/signup.html"));
});

app.get(["/login", "/login.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "../client/login.html"));
});

app.get(["/profile", "/profile.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "../client/profile.html"));
});

app.get(["/public", "/public.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "../client/public.html"));
});

// Error handler for HTML routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
});
