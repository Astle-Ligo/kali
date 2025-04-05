const mongoose = require("mongoose")

const goalSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    minute: { type: Number, required: true },
    type: { type: String, enum: ["regular", "penalty", "ownGoal"], required: true },
    assist: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null }
});

const yellowCardSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    minute: { type: Number, required: true }
});

const redCardSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    minute: { type: Number, required: true }
});


const substitutionSchema = new mongoose.Schema({
    playerOut: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    playerIn: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    minute: { type: Number, required: true }
});

// Schema for a match
const matchSchema = new mongoose.Schema({
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true }, // ✅ Added tournament reference
    date: { type: Date, required: true },
    score: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
    },
    goals: [goalSchema], // Array of goals scored in the match
    yellowCards: [yellowCardSchema], // Array of yellow cards
    redCards: [redCardSchema], // Array of red cards
    substitutions: [substitutionSchema], // Array of substitutions made
    status: {
        type: String,
        enum: ["upcoming", "live", "completed"],
        default: "upcoming"
    },
}, { timestamps: true }); // ✅ Added timestamps


const Match = mongoose.model("Match", matchSchema)
module.exports = Match