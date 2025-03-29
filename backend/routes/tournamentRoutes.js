const express = require("express");
const { protect } = require("../middleware/auth");

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


module.exports = router;
