const Team = require("../models/Team")
const Tournament = require("../models/tournament");
const User = require("../models/user");

// @desc Create a new team
// @route POST /api/teams/create
// @access Private (Only logged-in users)
const createTeam = async (req, res) => {
    try {
        console.log("Received request body:", req.body);  // Debugging

        const { name, tournamentId, manager, contact, email, players } = req.body;

        if (!name || !tournamentId || !manager) {
            return res.status(400).json({ message: "Team name, tournament ID, and manager name are required" });
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const newTeam = new Team({
            name,
            tournament: tournamentId,
            manager, // Store manager name as string
            contact,
            email,
            players,
            createdBy: req.user._id,
        });

        await newTeam.save();
        tournament.teams.push(newTeam._id);
        await tournament.save();
        res.status(201).json({ message: "Team created successfully", team: newTeam });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: error.message });
    }
};


// @desc Get teams by tournament
// @route GET /api/teams/tournament/:tournamentId
// @access Public
const getTeamsByTournament = async (req, res) => {
    try {
        const teams = await Team.find({ tournament: req.params.tournamentId })
            .populate("manager", "name email")
            .populate("players", "name email");
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get a single team by ID
// @route GET /api/teams/:id
// @access Public
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.json(team);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Join a team
// @route POST /api/teams/:id/join
// @access Private (Logged-in users)
const joinTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.players.includes(req.user._id)) {
            return res.status(400).json({ message: "You are already in this team" });
        }

        team.players.push(req.user._id);
        await team.save();

        res.status(200).json({ message: "Successfully joined the team", team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete a team
// @route DELETE /api/teams/:id
// @access Private (Only team manager)
const deleteTeam = async (req, res) => {
    const { id } = req.params;

    try {
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // Remove the team from the tournament's team list
        await Tournament.findByIdAndUpdate(team.tournament, {
            $pull: { teams: id }
        });

        // Delete the team from the database
        await Team.findByIdAndDelete(id);

        res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const updateTeam = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedTeam = await Team.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json(updatedTeam);
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ message: 'Error updating team', error });
    }
};

const addPlayers = async (req, res) => {
    try {
        console.log("Received request to add players");
        console.log("Team ID:", req.params.teamId);
        console.log("Players Data:", req.body.players);

        const { teamId } = req.params;
        const { players } = req.body; // Expecting an array of players

        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }

        if (!Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ message: "Invalid players data" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        console.log("Team found:", team.name);

        // Add new players to the team
        const newPlayers = players.map(player => ({
            name: player.name,
            jerseyNumber: player.jerseyNumber,
            position: player.position,
            matchesPlayed: player.matchesPlayed || 0,
            goals: player.goals || 0,
            assists: player.assists || 0,
            yellowCards: player.yellowCards || 0,
            redCards: player.redCards || 0,
        }));

        team.players.push(...newPlayers);
        await team.save();

        console.log("Players added successfully");

        res.status(201).json({ message: "Players added successfully", team });
    } catch (error) {
        console.error("🚨 Error adding players:", error.message); // 👈 Log the full error
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = { createTeam, getTeamsByTournament, getTeamById, joinTeam, deleteTeam, updateTeam, addPlayers };
