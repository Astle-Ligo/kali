require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import CORS
const mongoose = require("mongoose"); // Import Mongoose
const connectDB = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const teamRoutes = require("./routes/teamRoutes"); // Import the team routes
const userRoutes = require("./routes/users");


connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:3000", // Adjust for production
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Enable credentials if needed
}));

// Handle OPTIONS requests (Preflight requests)
app.options("*", cors());


app.use(express.json());

// Middleware
app.use(express.json()); // Parse JSON requests

app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes)

console.log("JWT Secret:", process.env.JWT_SECRET);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Failed", err));

// Sample Route
app.get("/", (req, res) => {
    res.send("Football Tournament API Running...");
});

console.log("JWT_SECRET:", process.env.JWT_SECRET);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
