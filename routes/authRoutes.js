const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users"); // Ensure this model exists
const router = express.Router();
const passport = require("passport");

const admin = require("../config/firebaseAdmin");

// 🔹 Verify Firebase Token & Check User
router.post("/check-user", async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);

        let user = await User.findOne({ firebaseUID: decodedToken.uid });

        if (!user) {
            // Create new user in MongoDB
            user = new User({
                firebaseUID: decodedToken.uid,
                name: decodedToken.name || "No Name",
                email: decodedToken.email,
            });
            await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, error: "Unauthorized" });
    }
});

// 🔹 Firebase Logout (Handled on Client Side)
router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out" });
});


// ✅ Register New User
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "✅ Registration Successful" });
    } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
    }
});

// ✅ Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // Generate Token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "✅ Login Successful", token, user });
    } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
    }
});
module.exports = router;
