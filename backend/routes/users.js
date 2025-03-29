const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");
const User = require("../models/user");
const Tournament = require("../models/tournament");

const router = express.Router();

// 🔹 Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 🔹 SIGNUP (Register User)
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token: generateToken(newUser._id), // Send JWT Token
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


// 🔹 GET USER DASHBOARD DATA (Protected)
router.get("/dashboard", protect, async (req, res) => {
    try {
        console.log("🔍 Logged-in User ID:", req.user.id);

        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Fixing the query: Use "organizer" instead of "createdBy"
        const createdTournaments = await Tournament.find({ organizer: userId });
        console.log("🎯 Created Tournaments:", createdTournaments);

        const registeredTournaments = await Tournament.find({ "teams.managerId": userId });
        console.log("📋 Registered Tournaments:", registeredTournaments);

        res.json({ createdTournaments, registeredTournaments });
    } catch (error) {
        console.error("🔥 Dashboard Fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
