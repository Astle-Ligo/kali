const express = require("express");
const { protect, adminOrOrganizer } = require("../middleware/auth");
const {
    createTeam,
    getTeamsByTournament,
    getTeamById,
    joinTeam,
    deleteTeam,
    updateTeam,
    addPlayers
} = require("../controllers/teamController");

const router = express.Router();

router.post("/create", protect, createTeam);
router.get("/tournament/:tournamentId", protect, getTeamsByTournament);
router.get("/:id", protect, getTeamById);  // ✅ Keep only this route for fetching a single team
router.patch("/:id", protect, updateTeam);
router.post("/:id/join", protect, joinTeam);
router.delete("/:id", protect, deleteTeam);
router.post("/:teamId/add-player", protect, addPlayers);

module.exports = router;
