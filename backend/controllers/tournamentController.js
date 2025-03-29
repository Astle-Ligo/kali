const Tournament = require("../models/tournament");
const Team = require("../models/Team")

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
            teams, // This will be optional initially
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

        // Ensure teams is an array, even if empty
        if (teams && Array.isArray(teams)) {
            teams = teams.map(teamId => mongoose.Types.ObjectId(teamId));
        } else {
            teams = []; // Default to empty array if no teams are provided
        }


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
        res.status(201).json({ message: "Tournament created successfully", tournament });
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
        const tournament = await Tournament.findById(req.params.id).populate("teams");

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

        if (tournament.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this tournament" });
        }

        tournament.name = req.body.name || tournament.name;
        tournament.type = req.body.type || tournament.type;
        tournament.startDate = req.body.startDate || tournament.startDate;
        tournament.endDate = req.body.endDate || tournament.endDate;
        tournament.location = req.body.location || tournament.location;

        await tournament.save();
        res.status(200).json({ message: "Tournament updated successfully", tournament });
    } catch (error) {
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

        await tournament.deleteOne();
        res.status(200).json({ message: "Tournament deleted successfully" });
    } catch (error) {
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



module.exports = { createTournament, getTournaments, getTournamentById, updateTournament, deleteTournament, registerTeam, getMyTournaments, getJoinedTournaments, getMyTeamsForTournament, };
