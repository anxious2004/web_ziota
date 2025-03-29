require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const helmet = require("helmet"); // ✅ Security middleware
const cloudinary = require("cloudinary").v2;

const app = express();

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" })); // Allow frontend requests
app.use(helmet()); // ✅ Security Enhancements
app.use(express.static("public")); // Serve frontend

// ✅ Ensure MongoDB URI is Provided
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing in .env file.");
    process.exit(1);
}

// ✅ Connect to MongoDB (Removed Duplicate Call)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    });

// ✅ Session Middleware (OAuth Requires This First)
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false, // ✅ Prevent unnecessary session storage
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true }
}));

// ✅ Passport Configuration
require("./middleware/auth"); // Ensure Passport OAuth is configured
app.use(passport.initialize());
app.use(passport.session());

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courses");

app.use("/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Sample File Storage (For Testing Cloudinary)
const FILES = {
    java_notes: "https://res.cloudinary.com/dlcujlif7/raw/upload/v1742904097/Exp6_aj2fjl.docx",
    java_books: "cse_core/java_books.pdf",
    python_notes: "cse_core/python_notes.pdf",
};

// ✅ API to Fetch Cloudinary File URLs
app.get("/get-files", async (req, res) => {
    try {
        let fileLinks = {};
        for (const key in FILES) {
            if (!FILES[key]) {
                return res.status(404).json({ error: `File ${key} not found in Cloudinary` });
            }
            const cloudinaryUrl = cloudinary.url(FILES[key], { secure: true });
            fileLinks[key] = cloudinaryUrl;
        }
        res.json(fileLinks);
    } catch (error) {
        console.error("❌ Cloudinary Fetch Error:", error);
        res.status(500).json({ error: "Server error while fetching files" });
    }
});

// ✅ Server Health Check Route
app.get("/", (req, res) => {
    res.send("🚀 Ziota API is Running!");
});

// ✅ CORS Security Headers for Embedding
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    next();
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
