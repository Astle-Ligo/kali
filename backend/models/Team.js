const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  jerseyNumber: { type: Number, required: true },
  position: { type: String, required: true },
  matchesPlayed: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    manager: { type: String, required: true }, // Changed from ObjectId to String
    contact: { type: String, required: true },
    email: { type: String, required: true },
    players: [playerSchema], // ✅ Store players as objects instead of strings
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
