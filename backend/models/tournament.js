const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming the User model stores organizers
            required: true
        },

        type: {
            type: String,
            enum: ["League", "Knockout", "Group"],
            required: true,
        },
        faceToFaceMatches: {
            type: String,
            enum: ["1", "2"], // 1 Match or Home & Away
            default: "1",
        },
        numPlayers: {
            type: Number,
            enum: [5, 6, 7, 11], // 5-a-side, 6-a-side, etc.
            required: true,
        },
        numSubs: {
            type: Number,
            min: 1,
            max: 8,
            required: true,
        },
        numTeams: {
            type: Number,
            required: true
        }, // Number of teams

        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // Array to store team names

        matchVenueType: {
            type: String,
            enum: ["Single Venue", "Home & Away"],
            required: true,
        },
        location: {
            type: String,
        },
        mapLink: {
            type: String,
            trim: true,
        },
        registrationAmount: {
            type: Number,
            default: 0,
        },
        registrationStartDate: {
            type: Date,
            required: true,
        },
        registrationCloseDate: {
            type: Date,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        rules: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;
