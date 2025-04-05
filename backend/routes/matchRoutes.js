const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const matchController = require("../controllers/matchController");
const Match = require("../models/match")
const Player = require("../models/Players")

router.get("/", matchController.getMatchesByTournament);
router.post("/:matchId/update", matchController.addLiveUpdate);
router.post("/:matchId/result", protect, matchController.updateMatchResult);

router.patch("/:matchId/status", async (req, res) => {
    console.log("match status called");

    try {
        const { status } = req.body; // "live" or "completed"
        const { matchId } = req.params;

        if (!["upcoming", "live", "completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const match = await Match.findByIdAndUpdate(
            matchId,
            { status },
            { new: true }
        );

        if (!match) return res.status(404).json({ message: "Match not found" });

        res.json({ message: "Match status updated", match });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch("/:matchId/players", async (req, res) => {
    try {
        console.log("🔥 Players submission route hit");
        console.log("🧾 req.body:", req.body);
        const { matchId } = req.params;
        const { players } = req.body; // array of player IDs

        if (!players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ message: "⚠️ Players list is required and must be a non-empty array" });
        }

        // Convert to ObjectIds safely
        const playerIds = players.map(id => new mongoose.Types.ObjectId(id));

        // Run update
        const updateResult = await Player.updateMany(
            { _id: { $in: playerIds } },
            { $inc: { matchesPlayed: 1 } }
        );

        console.log("✅ Update result:", updateResult);

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "No matching players found" });
        }

        res.json({
            message: `✅ ${updateResult.modifiedCount} players updated`,
            data: updateResult
        });
    } catch (error) {
        console.error("❌ Error updating players:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



module.exports = router;
