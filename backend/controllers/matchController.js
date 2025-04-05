const Match = require("../models/match");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Player = require("../models/Players");

// Get matches for a specific tournament
const getMatchesByTournament = async (req, res) => {
    console.log("Hit");

    try {
        const { tournamentId } = req.query;
        if (!tournamentId) {
            return res.status(400).json({ message: "Tournament ID is required" });
        }
        console.log(tournamentId);

        const matches = await Match.find({ tournament: tournamentId })
            .populate({
                path: "homeTeam",
                populate: { path: "players", select: "name _id jerseyNumber" },
            })
            .populate({
                path: "awayTeam",
                populate: { path: "players", select: "name _id jerseyNumber" },
            });

        if (!matches.length) {
            return res.status(404).json({ message: "No matches found for this tournament" });
        }

        res.json(matches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update match result
const updateMatchResult = async (req, res) => {
    try {
        const { homeScore, awayScore } = req.body;
        const { matchId } = req.params;

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match not found" });

        match.score.home = homeScore;
        match.score.away = awayScore;
        match.status = "completed"; // Mark match as completed

        await match.save();
        res.status(200).json({ message: "Match result updated successfully", match });
    } catch (error) {
        console.error("Error updating match result:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add live update (goal, card, substitution)
const addLiveUpdate = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { updateType, player, minute, type, team, assist, playerIn, playerOut } = req.body;

        console.log("📤 Received live update request:", req.body);

        const match = await Match.findById(matchId).populate("homeTeam awayTeam");
        if (!match) return res.status(404).json({ message: "Match not found" });

        let updateEvent = { player, minute, team };

        if ((updateType === "goal" || updateType === "card") && (!player || !minute || !team)) {
            return res.status(400).json({ message: "Missing required fields for goal/card" });
        }
        if (updateType === "substitution" && (!playerIn || !playerOut || !minute || !team)) {
            return res.status(400).json({ message: "Missing required fields for substitution" });
        }

        if (updateType === "goal") {
            if (!type) return res.status(400).json({ message: "Goal type is required" });

            updateEvent.type = type;
            if (assist) updateEvent.assist = assist;
            match.goals.push(updateEvent);

            if (match.homeTeam._id.toString() === team) {
                match.score.home += 1;
            } else if (match.awayTeam._id.toString() === team) {
                match.score.away += 1;
            }

            console.log("Updated Goals:", match.goals);

            await Player.findByIdAndUpdate(player, { $inc: { goals: 1 } });

            if (assist) {
                await Player.findByIdAndUpdate(assist, { $inc: { assists: 1 } });
            }
        }

        if (updateType === "card") {
            if (!["yellow", "red"].includes(type)) {
                return res.status(400).json({ message: "Invalid card type" });
            }

            updateEvent.type = type;
            if (type === "yellow") {
                match.yellowCards.push(updateEvent);
                await Player.findByIdAndUpdate(player, { $inc: { yellowCards: 1 } });
            } else {
                match.redCards.push(updateEvent);
                await Player.findByIdAndUpdate(player, { $inc: { redCards: 1 } });
            }

            console.log("Updated Cards:", type === "yellow" ? match.yellowCards : match.redCards);
        }

        if (updateType === "substitution") {
            if (!playerIn || !playerOut) {
                return res.status(400).json({ message: "Both playerIn and playerOut are required" });
            }

            updateEvent.playerIn = playerIn;
            updateEvent.playerOut = playerOut;
            match.substitutions.push(updateEvent);
            console.log("Updated Substitutions:", match.substitutions);
        }

        await match.save();
        res.status(201).json({ message: "Live update recorded successfully", match });

    } catch (error) {
        console.error("🚨 Error adding live update:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = {
    getMatchesByTournament,
    updateMatchResult,
    addLiveUpdate
};
