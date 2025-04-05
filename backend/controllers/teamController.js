const mongoose = require('mongoose')
const Team = require("../models/Team")
const Tournament = require("../models/Tournament");
const User = require("../models/user");
const Match = require("../models/match")
const Player = require("../models/Players"); // Import the Player model


// @desc Create a new team
// @route POST /api/teams/create
// @access Private (Only logged-in users)
const createTeam = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { name, tournamentId, manager, contact, email, players } = req.body;

        if (!name || !tournamentId || !manager) {
            console.error("Missing required fields:", { name, tournamentId, manager });
            return res.status(400).json({ message: "Team name, tournament ID, and manager name are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({ message: "Invalid tournament ID format" });
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const newTeam = new Team({
            name,
            tournament: tournamentId,
            manager,
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
        console.error("🚨 Error creating team:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

// @desc Get a single team by IDf
// @route GET /api/teams/:id
// @access Public
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid team ID" });
        }

        // Find team and optionally populate fields (e.g., tournament, players)
        const team = await Team.findById(id)
            .populate("tournament", "name location") // Example: populate tournament name and location
            .populate("players", "name jerseyNumber") // Example: populate player names and positions
            .lean(); // Convert Mongoose document to a plain object

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

        const team = await Team.findById(teamId).populate("tournament");
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        console.log("Team found:", team.name);

        const tournament = team.tournament;
        const maxPlayers = (tournament.numPlayers ?? 11) + (tournament.numSubs ?? 8);

        if (team.players.length + players.length > maxPlayers) {
            return res.status(400).json({ message: `Maximum ${maxPlayers} players allowed per team.` });
        }

        // Ensure only one captain and one vice-captain
        const captainCount = players.filter(p => p.isCaptain).length;
        const viceCaptainCount = players.filter(p => p.isViceCaptain).length;

        if (captainCount > 1) {
            return res.status(400).json({ message: "Only one captain is allowed." });
        }
        if (viceCaptainCount > 1) {
            return res.status(400).json({ message: "Only one vice-captain is allowed." });
        }

        // Prevent duplicate jersey numbers
        const existingJerseyNumbers = new Set(team.players.map(p => p.jerseyNumber));
        for (const player of players) {
            if (existingJerseyNumbers.has(player.jerseyNumber)) {
                return res.status(400).json({ message: `Jersey number ${player.jerseyNumber} is already taken.` });
            }
        }

        // Add new players to the team
        const validPlayers = players.filter(player => player.name && player.jerseyNumber); // ✅ Ensure required fields

        if (validPlayers.length === 0) {
            return res.status(400).json({ message: "No valid players provided." });
        }

        const newPlayers = await Promise.all(validPlayers.map(async (player) => {
            const newPlayer = new Player({
                name: player.name,
                jerseyNumber: player.jerseyNumber,
                position: player.position || undefined,  // ❗ Use `undefined` instead of `null` to avoid validation issues
                team: teamId, // ✅ Assign this player to the team
                matchesPlayed: player.matchesPlayed ?? undefined, // ✅ Optional field
                goals: player.goals ?? undefined,
                assists: player.assists ?? undefined,
                yellowCards: player.yellowCards ?? undefined,
                redCards: player.redCards ?? undefined,
                isCaptain: player.isCaptain ?? false,
                isViceCaptain: player.isViceCaptain ?? false
            });

            await newPlayer.save(); // ✅ Save player to the database
            return newPlayer._id; // ✅ Store only the ID
        }));

        team.players.push(...newPlayers);
        await team.save();

        res.status(201).json({ message: "Players added successfully", team });

    } catch (error) {
        console.error("🚨 Error adding players:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



module.exports = { createTeam, getTeamsByTournament, getTeamById, joinTeam, deleteTeam, updateTeam, addPlayers };
