const mongoose = require("mongoose");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team")
const Match = require("../models/match");
const Player = require("../models/Players")


// @desc Create a new tournament
// @route POST /api/tournaments/create
// @access Private (Admin/Organizer)
const createTournament = async (req, res) => {
    try {
        let {
            name,
            type,
            faceToFaceMatches,
            numPlayers,
            numSubs,
            teams = [], // Default to an empty array if not provided
            numTeams,
            matchVenueType,
            location,
            mapLink,
            registrationAmount,
            registrationStartDate,
            registrationCloseDate,
            startDate,
            rules,
        } = req.body;

        // Ensure teams is an array of ObjectIds
        teams = teams.map(teamId => mongoose.Types.ObjectId(teamId));

        const tournament = new Tournament({
            name,
            type,
            faceToFaceMatches,
            numPlayers,
            numSubs,
            teams, // Initially empty, teams will be added later
            numTeams,
            matchVenueType,
            location,
            mapLink,
            registrationAmount,
            registrationStartDate,
            registrationCloseDate,
            startDate,
            rules,
            organizer: req.user.id, // Assuming authentication middleware adds `req.user.id`
        });

        await tournament.save();

        res.status(201).json({ message: "Tournament created successfully", tournament, matches });
    } catch (error) {
        console.error("Tournament creation error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all tournaments
// @route GET /api/tournaments
// @access Public
const getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate("organizer", "name email");
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get a single tournament by ID
// @route GET /api/tournaments/:id
// @access Public
const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate("teams"); // Populate the teams array

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json(tournament);
    } catch (error) {
        console.error("Error fetching tournament details:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// @desc Update a tournament
// @route PUT /api/tournaments/:id
// @access Private (Admin/Organizer)
const updateTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        // Authorization check to ensure that the user updating the tournament is the organizer
        if (tournament.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this tournament" });
        }

        // Update tournament fields based on the request body
        tournament.name = req.body.name || tournament.name;
        tournament.type = req.body.type || tournament.type;
        tournament.faceToFaceMatches = req.body.faceToFaceMatches || tournament.faceToFaceMatches;
        tournament.numPlayers = req.body.numPlayers || tournament.numPlayers;
        tournament.numSubs = req.body.numSubs || tournament.numSubs;
        tournament.numTeams = req.body.numTeams || tournament.numTeams;
        tournament.matchVenueType = req.body.matchVenueType || tournament.matchVenueType;
        tournament.location = req.body.location || tournament.location;
        tournament.mapLink = req.body.mapLink || tournament.mapLink;
        tournament.registrationAmount = req.body.registrationAmount || tournament.registrationAmount;
        tournament.registrationStartDate = req.body.registrationStartDate || tournament.registrationStartDate;
        tournament.registrationCloseDate = req.body.registrationCloseDate || tournament.registrationCloseDate;
        tournament.startDate = req.body.startDate || tournament.startDate;
        tournament.rules = req.body.rules || tournament.rules;

        // Save the updated tournament document to the database
        await tournament.save();
        res.status(200).json({ message: "Tournament updated successfully", tournament });
    } catch (error) {
        console.error("Error updating tournament:", error);
        res.status(500).json({ message: error.message });
    }
};


// @desc Delete a tournament
// @route DELETE /api/tournaments/:id
// @access Private (Admin/Organizer)
const deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (tournament.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this tournament" });
        }

        // Delete all associated matches
        await Match.deleteMany({ tournament: req.params.id });

        // Delete the tournament
        await tournament.deleteOne();

        res.status(200).json({ message: "Tournament and its matches deleted successfully" });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        res.status(500).json({ message: error.message });
    }
};


// @desc Register a team for a tournament
// @route POST /api/tournaments/:id/register
// @access Public
const registerTeam = async (req, res) => {
    try {
        const { name, manager } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (!name || !manager) {
            return res.status(400).json({ message: "Team name and manager name are required" });
        }

        // ✅ Add the team as an object instead of ObjectId
        tournament.teams.push({ name, manager });
        await tournament.save();

        res.status(200).json({ message: "Team registered successfully", tournament });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyTournaments = async (req, res) => {
    try {
        console.log("🛠️ Fetching tournaments for user:", req.user.id);

        // Fetch tournaments created by the user
        const createdTournaments = await Tournament.find({ organizer: req.user.id }).populate("organizer", "name email");
        console.log("📌 Created Tournaments:", createdTournaments);

        // Fetch teams where the user has registered
        const registeredTeams = await Team.find({ createdBy: req.user.id }).populate("tournament");
        console.log("📌 Registered Teams:", registeredTeams);

        // Extract tournament details from registered teams
        const registeredTournaments = registeredTeams.map(team => team.tournament);
        console.log("📌 Registered Tournaments:", registeredTournaments);

        res.json({
            createdTournaments,
            registeredTournaments
        });

    } catch (error) {
        console.error("🔥 Error fetching tournaments:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Fetch tournaments where the user is a registered team member
const getJoinedTournaments = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            console.log("🚨 Unauthorized access attempt - No user found");
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }

        const userId = req.user.id;
        console.log(`🔍 Searching for teams where user ${userId} is a player...`);

        // Find teams where the user is registered as a player
        const teams = await Team.find({ players: userId }).populate("tournament");

        if (!teams.length) {
            console.log("⚠️ No teams found for this user.");
        } else {
            console.log("✅ Found teams:", teams);
        }

        // Extract tournaments from these teams
        const joinedTournaments = teams.map(team => team.tournament);

        console.log("📌 Joined Tournaments:", joinedTournaments);
        res.status(200).json(joinedTournaments);
    } catch (error) {
        console.error("🔥 Error fetching joined tournaments:", error);
        res.status(500).json({ message: "Server error fetching joined tournaments", error });
    }
};

const getMyTeamsForTournament = async (req, res) => {
    try {
        const { id: tournamentId } = req.params;
        const userId = req.user.id; // Get logged-in user ID from JWT

        // Find teams where the manager is the logged-in user
        const userTeams = await Team.find({ tournament: tournamentId, managerId: userId });

        res.json(userTeams);
    } catch (error) {
        console.error("Error fetching user's teams:", error);
        res.status(500).json({ message: "Error fetching user teams", error });
    }
};

const generateMatchSchedule = (tournament) => {
    const { type, faceToFaceMatches, startDate, teams } = tournament;
    const matches = [];

    console.log("✅ Generating Match Schedule");

    // Fisher-Yates shuffle
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffledTeams = shuffleArray(teams.slice());
    console.log(shuffledTeams);

    if (type === "Group") {
        for (let i = 0; i < shuffledTeams.length; i += 4) {
            const group = shuffledTeams.slice(i, i + 4);
            if (group.length < 4) break;

            for (let j = 0; j < group.length; j++) {
                for (let k = j + 1; k < group.length; k++) {
                    matches.push({
                        homeTeam: group[j]._id,
                        awayTeam: group[k]._id,
                        tournament: tournament._id,
                        date: new Date(startDate),
                    });
                }
            }
        }
    } else if (type === "League") {
        for (let i = 0; i < shuffledTeams.length; i++) {
            for (let j = i + 1; j < shuffledTeams.length; j++) {
                matches.push({
                    homeTeam: shuffledTeams[i]._id,
                    awayTeam: shuffledTeams[j]._id,
                    tournament: tournament._id,
                    date: new Date(startDate),
                });
                console.log(homeTeam, awayTeam, tournament, date);

                if (faceToFaceMatches === "2") {
                    matches.push({
                        homeTeam: shuffledTeams[j]._id,
                        awayTeam: shuffledTeams[i]._id,
                        tournament: tournament._id,
                        date: new Date(startDate),
                    });
                }
            }
        }
    } else if (type === "Knockout") {
        // Shuffle teams to randomize matchups
        const knockoutTeams = shuffleArray(teams.slice());

        // Make sure there are even number of teams
        if (knockoutTeams.length % 2 !== 0) {
            // If odd number of teams, give one team a bye
            knockoutTeams.push({ _id: "BYE" }); // You can handle this 'BYE' logic later if needed
        }

        for (let i = 0; i < knockoutTeams.length; i += 2) {
            matches.push({
                homeTeam: knockoutTeams[i]._id,
                awayTeam: knockoutTeams[i + 1]._id,
                tournament: tournament._id,
                date: new Date(startDate),
            });
        }
    }

    console.log(matches);

    return matches;
};


// In your tournamentController.js file
const getTournamentMatches = async (req, res) => {
    try {
        const matches = await Match.find({ tournament: req.params.id })
            .populate("homeTeam awayTeam"); // Populate team details
        if (!matches.length) {
            return res.status(404).json({ message: "No matches found for this tournament" });
        }
        res.json(matches);
    } catch (error) {
        console.error("Error fetching tournament matches:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Generate match schedule for a tournament
// @route POST /api/tournaments/:id/generate-schedule
// @access Private (Admin/Organizer)
const generateSchedule = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate("teams");
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        const matches = generateMatchSchedule(tournament);
        const createdMatches = await Match.insertMany(matches);

        tournament.matches = createdMatches.map(m => m._id);
        await tournament.save();

        res.status(200).json(createdMatches);
    } catch (error) {
        console.error("🔥 Error generating schedule:", error);
        res.status(500).json({ message: 'Error generating match schedule' });
    }
};



const getTournamentStats = async (req, res) => {
    try {


        const { id: tournamentId } = req.params;
        if (!tournamentId) {
            return res.status(400).json({ message: "Tournament ID is required" });
        }

        // Fetch top 5 players for each category
        const topPlayers = {
            goals: await Player.find().sort({ goals: -1 }).limit(5),
            assists: await Player.find().sort({ assists: -1 }).limit(5),
            yellowCards: await Player.find().sort({ yellowCards: -1 }).limit(5),
            redCards: await Player.find().sort({ redCards: -1 }).limit(5),
        };

        // Fetch top 5 teams for goals, defense, cards
        const topTeams = {
            goals: await Team.find({ tournament: tournamentId }).sort({ goalsFor: -1 }).limit(5),
            defense: await Team.find({ tournament: tournamentId }).sort({ goalsAgainst: 1 }).limit(5), // Best defense = least goals conceded
            yellowCards: await Team.find({ tournament: tournamentId }).sort({ yellowCards: -1 }).limit(5),
            redCards: await Team.find({ tournament: tournamentId }).sort({ redCards: -1 }).limit(5),
        };

        // Fetch full points table
        const pointsTable = await Team.find({ tournament: tournamentId })
            .select("name matchesPlayed wins draws losses goalsFor goalsAgainst points")
            .sort({ points: -1 });
        res.json({ topPlayers, topTeams, pointsTable });

    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: error.message });
    }
};



module.exports = { createTournament, getTournaments, getTournamentById, updateTournament, deleteTournament, registerTeam, getMyTournaments, getJoinedTournaments, getMyTeamsForTournament, generateMatchSchedule, getTournamentMatches, generateSchedule, getTournamentStats };
