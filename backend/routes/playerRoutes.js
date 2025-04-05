const express = require("express");
const router = express.Router();
const Player = require("../models/Players");

// Fetch player by ID
router.get("/:id", async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ message: "Player not found" });
        }
        res.json(player);
    } catch (error) {
        console.error("Error fetching player:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
