const express = require("express");
const { protect } = require("../middleware/auth");
const Match = require("../models/match")
const Player = require("../models/Players")
const tournamentController = require("../controllers/tournamentController");
console.log("🎯 Tournament Controller:", tournamentController);

const {
    createTournament,
    getTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    registerTeam,
    getMyTournaments,
    getJoinedTournaments,
    getMyTeamsForTournament,
    getTournamentMatches,
    generateSchedule,
    getTournamentStats
} = tournamentController;

const router = express.Router();

// Routes
router.post("/create", protect, createTournament);
router.get("/", getTournaments);
router.get("/my-tournaments", protect, getMyTournaments); // ✅ Fix: Add protected route
router.get("/joined", protect, getJoinedTournaments);
router.get("/:id", getTournamentById);
router.patch("/:id", protect, updateTournament);
router.delete("/:id", protect, deleteTournament);
router.post("/:id/register", protect, registerTeam); // New route for team registration
router.get("/:id/my-teams", protect, getMyTeamsForTournament);
router.get("/:id/matches", protect, getTournamentMatches);
router.post("/:id/generate-schedule", protect, generateSchedule);
router.get("/:id/stats", protect, getTournamentStats);

router.get("/:id/matches/status", protect, async (req, res) => {

    try {
        const { id } = req.params;
        const { status } = req.query;

        const query = { tournament: id };

        // Support multiple statuses: status=upcoming,completed
        if (status) {
            const statusArray = status.split(",").map(s => s.trim());
            query.status = { $in: statusArray };
        }

        const matches = await Match.find(query)
            .populate({
                path: "homeTeam",
                select: "name players",
                populate: {
                    path: "players",
                    model: "Player",
                    select: "name jerseyNumber"
                }
            })
            .populate({
                path: "awayTeam",
                select: "name players",
                populate: {
                    path: "players",
                    model: "Player",
                    select: "name jerseyNumber"
                }
            });
        res.json(matches);
    } catch (error) {
        console.error("❌ Error fetching matches:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
