const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const { protect } = require("../middleware/auth");


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Change this in production



// 🔹 SIGNUP ROUTE
router.post(
    "/signup",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Valid email is required").isEmail(),
        check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    ],
    async (req, res) => {
        console.log("Received Signup Request:", req.body); // 🔍 Debug Log

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation Errors:", errors.array()); // 🔍 Debug Log
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: "User already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ name, email, password: hashedPassword });
            await user.save();

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.status(201).json({ token, message: "Signup successful" });
        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({ message: "Server Error" });
        }
    }
);


// 🔹 LOGIN ROUTE
router.post(
    "/login",
    [
        check("email", "Valid email is required").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        console.log("Received Login Request:", req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation Errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                console.log("User not found for email:", email);
                return res.status(400).json({ message: "Invalid credentials" });
            }

            console.log("Stored Hashed Password in DB:", user.password);

            // Compare password without hashing again
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Entered Password:", password);
            console.log("Comparison Result:", isMatch);

            if (!isMatch) {
                console.log("Password mismatch for user:", email);
                return res.status(400).json({ message: "Invalid credentials" });
            }

            console.log("Login Successful:", email);
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

            res.json({ token });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Server Error" });
        }
    }
);

router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        console.log("🔍 User Found:", user);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("🔥 Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
