const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users"); // Make sure 'Users.js' exists
const router = express.Router();

const admin = require("../config/firebaseAdmin");
const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data to request
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = authenticateUser;

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json("User registered");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json("Invalid credentials");
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json("Invalid credentials");
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
