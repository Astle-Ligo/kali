import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreatedTournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState({});
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [activeTab, setActiveTab] = useState("teams");
    const [liveUpdates, setLiveUpdates] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [updateType, setUpdateType] = useState("");
    const [minute, setMinute] = useState("");
    const [subIn, setSubIn] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(""); // Stores selected team
    const [assistPlayer, setAssistPlayer] = useState(""); // Stores assist player (for goals)
    const [ownGoal, setOwnGoal] = useState("")
    const [subOut, setSubOut] = useState("")
    const [goalType, setGoalType] = useState("")
    const [players, setPlayers] = useState({})
    const [stats, setStats] = useState({ topPlayers: [], topTeams: [] });
    const [error, setError] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [submittedMatches, setSubmittedMatches] = useState([]);

    useEffect(() => {
        console.log("🪪 Auth Token:", token);
        console.log("🌐 API URL:", process.env.REACT_APP_API_URL);
        const fetchTournamentDetails = async () => {
            if (!token) {
                console.error("No authentication token found!");
                return;
            }

            setLoading(true); // Start loading

            try {
                // Fetch Tournament Details
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTournament(response.data);

                // Fetch Matches separately
                const matchesResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/matches?tournamentId=${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMatches(matchesResponse.data);

                // Fetch Teams
                const teamIds = response.data.teams.map(team => team._id).filter(id => id);
                if (teamIds.length > 0) {
                    const teamResponses = await Promise.all(
                        teamIds.map(teamId =>
                            axios.get(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                        )
                    );

                    const teamData = {};
                    const playerData = {}; // 👈 Store players here

                    teamResponses.forEach(teamRes => {
                        const team = teamRes.data;
                        teamData[team._id] = team;

                        // Ensure players array is correctly set
                        playerData[team._id] = Array.isArray(team.players) ? team.players : [];
                    });

                    setTeams(teamData);
                    setPlayers(playerData); // ✅ Store players correctly
                }
            } catch (error) {
                console.error("Error fetching tournament details:", error);
            }

            setLoading(false); // Stop loading
        };

        fetchTournamentDetails();
    }, [id, token]);

    // ✅ Unified function to handle live updates
    const handleLiveUpdate = async (e) => {
        e.preventDefault(); // Prevent default form behavior

        if (!selectedMatch || !updateType) {
            alert("Please select a match and update type!");
            return;
        }

        let updateData = { minute };

        // **Goal Update**
        if (updateType === "goal") {
            if (!selectedPlayer || !goalType || !selectedTeam) {
                alert("Please select the player, goal type, and team!");
                return;
            }

            updateData = {
                player: selectedPlayer,
                minute,
                type: goalType, // "regular", "penalty", "ownGoal"
                team: selectedTeam,
                assist: goalType === "regular" && assistPlayer ? assistPlayer : null,
                updateType: "goal",
            };
        }

        // **Yellow/Red Card Update**
        else if (updateType === "yellow" || updateType === "red") {
            if (!selectedPlayer || !selectedTeam) {
                alert("Please select the player and team for the card!");
                return;
            }

            updateData = {
                player: selectedPlayer,
                minute,
                type: updateType, // "yellow" or "red"
                team: selectedTeam,
                updateType: "card",
            };
        }

        // **Substitution Update**
        else if (updateType === "substitution") {
            if (!subOut || !subIn || !selectedTeam) {
                alert("Please select the player being substituted out, the player being substituted in, and the team!");
                return;
            }

            updateData = {
                playerOut: subOut, // Use subOut instead of playerOut
                playerIn: subIn,   // Use subIn instead of playerIn
                minute,
                team: selectedTeam,
                updateType: "substitution",
            };
        }


        try {
            console.log("📤 Sending Live Update:", updateData);

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/matches/${selectedMatch}/update`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ Server Response:", response.data);
            alert("Live update added successfully!");

            // **Update UI without `liveUpdates`**
            setMatches((prevMatches) =>
                prevMatches.map((m) =>
                    m._id === selectedMatch
                        ? {
                            ...m,
                            goals: updateType === "goal" ? [...(m.goals || []), response.data.match.goals.pop()] : m.goals,
                            yellowCards: updateType === "yellow" ? [...(m.yellowCards || []), response.data.match.yellowCards.pop()] : m.yellowCards,
                            redCards: updateType === "red" ? [...(m.redCards || []), response.data.match.redCards.pop()] : m.redCards,
                            substitutions: updateType === "substitution" ? [...(m.substitutions || []), response.data.match.substitutions.pop()] : m.substitutions,
                        }
                        : m
                )
            );

        } catch (error) {
            console.error("❌ Error adding live update:", error);
            alert(error.response?.data?.message || "Failed to add live update.");
        }
    };

    useEffect(() => {
        if (activeTab === "stats") {

            const fetchTournamentStats = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tournaments/${id}/stats`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` // Attach token here
                        }
                    });
                    const data = await response.json();
                    setStats(data);
                } catch (error) {
                    console.error("Error fetching stats:", error);
                }
            };

            fetchTournamentStats();
        }
    }, [activeTab, id]);
    // Fetch again if activeTab or tournamentId changes

    const handleEditTournament = () => {
        navigate(`/edit-tournament/${id}`);
    };

    const handleCloseRegistration = async () => {
        try {
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/tournaments/${id}/close-registration`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Registration closed!");
            setTournament((prev) => ({ ...prev, registrationOpen: false }));
        } catch (error) {
            console.error("Error closing registration:", error);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm("Are you sure you want to delete this team?")) return;

        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/teams/${teamId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Team deleted successfully!");
            setTournament((prev) => ({
                ...prev,
                teams: prev.teams.filter((team) => team._id !== teamId),
            }));
        } catch (error) {
            console.error("Error deleting team:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "update") {
            const fetchMatches = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/tournaments/${id}/matches/status?status=upcoming,live,completed`,
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    const text = await response.text();
                    const data = JSON.parse(text);

                    if (Array.isArray(data)) {
                        setUpcomingMatches(data);
                    } else {
                        console.error("Unexpected API response:", data);
                        setUpcomingMatches([]);
                    }
                } catch (error) {
                    console.error("Error fetching matches:", error);
                    setUpcomingMatches([]);
                }
            };

            fetchMatches();
        }
    }, [activeTab, id]);


    const updateMatchStatus = async (matchId, status) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/${matchId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to update match status:", errorData.message);
                return;
            }

            // 🔁 Refetch all matches with full player population
            const refreshedResponse = await fetch(
                `${process.env.REACT_APP_API_URL}/api/tournaments/${id}/matches/status?status=upcoming,live,completed`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            const refreshedData = await refreshedResponse.json();
            console.log(refreshedData);

            setUpcomingMatches(Array.isArray(refreshedData) ? refreshedData : []);
        } catch (error) {
            console.error("Error updating match status:", error);
        }
    };


    const handlePlayerSelection = (playerId) => {
        setSelectedPlayers(prev => prev.includes(playerId)
            ? prev.filter(id => id !== playerId)
            : [...prev, playerId]);
    };

    const submitMatchResult = async (matchId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/matches/${matchId}/players`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ players: selectedPlayers }),
            });

            if (!res.ok) throw new Error("Failed to update players");

            // ✅ Clear selected players
            setSelectedPlayers([]);

            // ✅ Mark this match as submitted
            setSubmittedMatches((prev) => [...prev, matchId]);

        } catch (error) {
            console.error("Error updating match result:", error);
        }
    };

    const handleGenerateSchedule = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/tournaments/${id}/generate-schedule`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Schedule generated successfully!");
            setTournament((prev) => ({ ...prev, matches: response.data.matches }));
        } catch (error) {
            console.error("Error generating schedule:", error);
        }
    };

    if (loading) return <p>Loading tournament details...</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
                {tournament ? (
                    <>
                        {/* 🎉 Row 1: Tournament Details */}
                        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                            <h1 className="text-3xl font-bold mb-4 text-blue-600">{tournament.name}</h1>
                            <div className="grid grid-cols-2 gap-6">
                                <p className="text-gray-700 font-semibold">📍 Location: <span className="text-black">{tournament.location}</span></p>
                                <p className="text-gray-700 font-semibold">📅 Date: <span className="text-black">{new Date(tournament.startDate).toLocaleDateString()}</span></p>
                                <p className="text-gray-700 font-semibold">🛠 Format: <span className="text-black">{tournament.type}</span></p>
                                <p className="text-gray-700 font-semibold">
                                    📝 Status:
                                    <span className={`ml-1 px-2 py-1 rounded text-white ${new Date() >= new Date(tournament.registrationStartDate) &&
                                        new Date() <= new Date(tournament.registrationCloseDate)
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}>
                                        {new Date() >= new Date(tournament.registrationStartDate) &&
                                            new Date() <= new Date(tournament.registrationCloseDate)
                                            ? "Open"
                                            : "Closed"}
                                    </span>
                                </p>

                                <p className="text-gray-700 font-semibold">🏆 Teams Registered: <span className="text-black">{tournament.teams.length}</span></p>
                            </div>
                        </div>

                        {/* ⚙️ Row 3: Organizer Options */}
                        <div className="mt-6 bg-gray-200 p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800">⚙️ Organizer Controls</h2>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={handleEditTournament}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                                >
                                    ✏️ Edit Tournament
                                </button>
                                {/* {new Date() >= new Date(tournament.registrationStartDate) &&
                                    new Date() <= new Date(tournament.registrationCloseDate) && (
                                        <button
                                            onClick={handleCloseRegistration}
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                                        >
                                            🚫 Close Registration
                                        </button>
                                    )} */}

                                <button
                                    onClick={handleGenerateSchedule}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                                >
                                    📅 Generate Match Schedule
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex justify-between border-b mt-6">
                            {["teams", "stats", "schedule", "update", "live", "entry"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 w-full text-center ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                >
                                    {tab === "teams" && "Registered Teams"}
                                    {tab === "stats" && "Overall Stats"}
                                    {tab === "schedule" && "Schedule"}
                                    {tab === "update" && "Match Updates"}
                                    {tab === "live" && "Live Updates"}
                                    {tab === "entry" && "Result Entry"}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="mt-4">
                            {activeTab === "teams" && (
                                <>
                                    <h2 className="text-xl font-semibold mt-3 mb-3">📋 Registered Teams</h2>
                                    {tournament.teams.length > 0 ? (
                                        <ul className="space-y-2">
                                            {tournament.teams.map((team) => (
                                                <li key={team._id} className="p-3 bg-gray-100 rounded-md shadow flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">{team.name}</span>
                                                        <p className="text-sm text-gray-600">📞 {team.contact}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteTeam(team._id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-md"
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600">No teams registered yet.</p>
                                    )}
                                </>
                            )}

                            {activeTab === "schedule" && (
                                <>
                                    <h2 className="text-xl font-semibold mt-3 mb-3">📅 Match Schedule</h2>
                                    {matches.length > 0 && Object.keys(teams).length > 0 ? (
                                        <ul className="space-y-2">
                                            {matches.map((match) => {
                                                // Ensure we are getting the correct team IDs
                                                const homeTeamId = match.homeTeam?._id || match.homeTeam;
                                                const awayTeamId = match.awayTeam?._id || match.awayTeam;

                                                // Fetch team names using the corrected team IDs
                                                const homeTeam = teams[homeTeamId]?.name || "Loading...";
                                                const awayTeam = teams[awayTeamId]?.name || "Loading...";

                                                return (
                                                    <li key={match._id} className="p-3 bg-gray-100 rounded-md shadow flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium">
                                                                {homeTeam} vs {awayTeam}
                                                            </span>
                                                            <p className="text-sm text-gray-600">Date: {match.date ? new Date(match.date).toLocaleString() : "TBD"}</p>
                                                            <p className="text-sm text-gray-600">Venue: {match.venue || "TBD"}</p>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600">No matches scheduled yet or teams are still loading...</p>
                                    )}
                                </>
                            )}


                            {activeTab === "stats" && (
                                <div className="text-gray-700">
                                    <h2 className="text-xl font-semibold mb-4">📊 Tournament Statistics</h2>

                                    {/* 🏆 Full Points Table */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold">🏆 Points Table</h3>
                                        {stats?.pointsTable?.length > 0 ? (
                                            <table className="w-full border border-gray-300 mt-2">
                                                <thead>
                                                    <tr className="bg-gray-200">
                                                        <th className="p-2">Team</th>
                                                        <th className="p-2">Matches</th>
                                                        <th className="p-2">Wins</th>
                                                        <th className="p-2">Draws</th>
                                                        <th className="p-2">Losses</th>
                                                        <th className="p-2">Goals For</th>
                                                        <th className="p-2">Goals Against</th>
                                                        <th className="p-2">Points</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stats.pointsTable.map((team, index) => (
                                                        <tr key={index} className="border-t">
                                                            <td className="p-2">{team?.name || "N/A"}</td>
                                                            <td className="p-2">{team?.matchesPlayed ?? 0}</td>
                                                            <td className="p-2">{team?.wins ?? 0}</td>
                                                            <td className="p-2">{team?.draws ?? 0}</td>
                                                            <td className="p-2">{team?.losses ?? 0}</td>
                                                            <td className="p-2">{team?.goalsFor ?? 0}</td>
                                                            <td className="p-2">{team?.goalsAgainst ?? 0}</td>
                                                            <td className="p-2 font-bold">{team?.points ?? 0}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="text-center">No points table available.</p>
                                        )}
                                    </div>

                                    {/* 🎯 Individual Top 5 Players */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold">🎯 Individual Top 5 Players</h3>

                                        {["goals", "assists", "yellowCards", "redCards"].map((stat, i) => (
                                            <div key={i} className="mb-4">
                                                <h4 className="text-md font-semibold">
                                                    {stat === "goals" && "⚽ Goals"}
                                                    {stat === "assists" && "🎯 Assists"}
                                                    {stat === "yellowCards" && "🟡 Yellow Cards"}
                                                    {stat === "redCards" && "🔴 Red Cards"}
                                                </h4>
                                                <ul className="list-disc ml-5">
                                                    {stats?.topPlayers?.[stat]?.length > 0 ? (
                                                        stats.topPlayers[stat].map((player, index) => (
                                                            <li key={index}>{player?.name || "N/A"} - {player?.[stat] ?? 0}</li>
                                                        ))
                                                    ) : (
                                                        <li>No data available.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 🏅 Top 5 Teams */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold">🏅 Team Statistics</h3>

                                        {["goalsFor", "goalsAgainst", "yellowCards", "redCards"].map((stat, i) => (
                                            <div key={i} className="mb-4">
                                                <h4 className="text-md font-semibold">
                                                    {stat === "goalsFor" && "⚽ Most Goals Scored"}
                                                    {stat === "goalsAgainst" && "🛡️ Best Defense"}
                                                    {stat === "yellowCards" && "🟡 Most Yellow Cards"}
                                                    {stat === "redCards" && "🔴 Most Red Cards"}
                                                </h4>
                                                <ul className="list-disc ml-5">
                                                    {stats?.topTeams?.length > 0 ? (
                                                        stats.topTeams.map((team, index) => (
                                                            <li key={index}>{team?.name || "N/A"} - {team?.[stat] ?? 0}</li>
                                                        ))
                                                    ) : (
                                                        <li>No data available.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                            {activeTab === "entry" && (
                                <p className="text-gray-700">📋 Match results will be displayed here.</p>
                            )}

                            {/* Live Updates Tab */}
                            {activeTab === "live" && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-semibold mt-3 mb-3">🎥 Live Match Updates</h2>

                                    {/* Select Match */}
                                    <label className="block mb-2">Select Match:</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={selectedMatch}
                                        onChange={(e) => {
                                            setSelectedMatch(e.target.value);
                                            setSelectedTeam(""); // Reset selections
                                            setUpdateType("");
                                            setGoalType("");
                                            setSelectedPlayer("");
                                            setAssistPlayer("");
                                            setMinute("");
                                        }}
                                    >
                                        <option value="">-- Select a Match --</option>
                                        {matches.map((match) => {
                                            const homeTeamId = match.homeTeam?._id || match.homeTeam;
                                            const awayTeamId = match.awayTeam?._id || match.awayTeam;
                                            return (
                                                <option key={match._id} value={match._id}>
                                                    {teams[homeTeamId]?.name || "Loading..."} vs {teams[awayTeamId]?.name || "Loading..."}
                                                </option>
                                            );
                                        })}
                                    </select>

                                    {/* Select Action Type */}
                                    <label className="block mt-4 mb-2">Select Action:</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={updateType}
                                        onChange={(e) => {
                                            setUpdateType(e.target.value);
                                            setSelectedTeam("");
                                            setGoalType("");
                                            setSelectedPlayer("");
                                            setAssistPlayer("");
                                            setMinute("");
                                        }}
                                    >
                                        <option value="">-- Select an Update Type --</option>
                                        <option value="goal">⚽ Goal</option>
                                        <option value="yellow">🟨 Yellow Card</option>
                                        <option value="red">🟥 Red Card</option>
                                        <option value="substitution">🔄 Substitution</option>
                                    </select>

                                    {/* Select Team for All Events (Goals, Cards, Substitutions) */}
                                    {updateType && selectedMatch && (
                                        <>
                                            <label className="block mt-4 mb-2">Select Team:</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={selectedTeam}
                                                onChange={(e) => setSelectedTeam(e.target.value)}
                                            >
                                                <option value="">-- Select a Team --</option>
                                                {(() => {
                                                    const selectedMatchData = matches.find((match) => match._id === selectedMatch);
                                                    if (!selectedMatchData) return null;
                                                    const homeTeamId = selectedMatchData.homeTeam?._id || selectedMatchData.homeTeam;
                                                    const awayTeamId = selectedMatchData.awayTeam?._id || selectedMatchData.awayTeam;
                                                    return (
                                                        <>
                                                            <option key={homeTeamId} value={homeTeamId}>
                                                                {teams[homeTeamId]?.name || "Loading..."}
                                                            </option>
                                                            <option key={awayTeamId} value={awayTeamId}>
                                                                {teams[awayTeamId]?.name || "Loading..."}
                                                            </option>
                                                        </>
                                                    );
                                                })()}
                                            </select>
                                        </>
                                    )}

                                    {/* Goal-Specific Fields */}
                                    {updateType === "goal" && selectedTeam && (
                                        <>
                                            <label className="block mt-4 mb-2">Goal Type:</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={goalType}
                                                onChange={(e) => setGoalType(e.target.value)}
                                            >
                                                <option value="">-- Select Goal Type --</option>
                                                <option value="regular">⚽ Regular Goal</option>
                                                <option value="penalty">🎯 Penalty</option>
                                                <option value="freekick">🥅 Free Kick</option>
                                                <option value="ownGoal">⚠️ Own Goal</option>
                                            </select>

                                            {/* Select Player */}
                                            <label className="block mt-4 mb-2">
                                                {goalType === "ownGoal" ? "Select Opponent Player:" : "Select Player:"}
                                            </label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={selectedPlayer}
                                                onChange={(e) => setSelectedPlayer(e.target.value)}
                                            >
                                                <option value="">-- Select a Player --</option>
                                                {(() => {
                                                    const selectedMatchData = matches.find((match) => match._id === selectedMatch);
                                                    if (!selectedMatchData) return null;

                                                    const homeTeamId = selectedMatchData.homeTeam?._id || selectedMatchData.homeTeam;
                                                    const awayTeamId = selectedMatchData.awayTeam?._id || selectedMatchData.awayTeam;

                                                    // Determine the correct team for player selection
                                                    const opponentTeamId = selectedTeam === homeTeamId ? awayTeamId : homeTeamId;
                                                    const teamToUse = goalType === "ownGoal" ? opponentTeamId : selectedTeam;

                                                    return (players[teamToUse] || []).map((player) => (
                                                        <option key={player._id} value={player._id}>
                                                            {player.jerseyNumber} - {player.name}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>

                                            {/* Assist Player Selection for Regular Goals */}
                                            {goalType === "regular" && (
                                                <>
                                                    <label className="block mt-4 mb-2">Assist by:</label>
                                                    <select
                                                        className="w-full p-2 border rounded-md"
                                                        value={assistPlayer}
                                                        onChange={(e) => setAssistPlayer(e.target.value)}
                                                    >
                                                        <option value="">-- Select an Assist Player --</option>
                                                        {teams[selectedTeam]?.players?.filter((player) => player._id !== selectedPlayer).map((player) => (
                                                            <option key={player._id} value={player._id}>
                                                                {player.jerseyNumber} - {player.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            )}

                                            {/* Minute Input */}
                                            <label className="block mt-4 mb-2">Minute:</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded-md"
                                                value={minute}
                                                onChange={(e) => setMinute(e.target.value)}
                                                placeholder="Enter minute"
                                            />
                                        </>
                                    )}

                                    {/* Yellow and Red Card Section */}
                                    {(updateType === "yellow" || updateType === "red") && selectedTeam && (
                                        <>
                                            <label className="block mt-4 mb-2">Select Player:</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={selectedPlayer}
                                                onChange={(e) => setSelectedPlayer(e.target.value)}
                                            >
                                                <option value="">-- Select a Player --</option>
                                                {(players[selectedTeam] || []).map((player) => (
                                                    <option key={player._id} value={player._id}>
                                                        {player.jerseyNumber} - {player.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="block mt-4 mb-2">Minute:</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded-md"
                                                value={minute}
                                                onChange={(e) => setMinute(e.target.value)}
                                                placeholder="Enter minute"
                                            />
                                        </>
                                    )}

                                    {/* Substitution Section */}
                                    {updateType === "substitution" && selectedTeam && (
                                        <>
                                            <label className="block mt-4 mb-2">Player Substituted Out:</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={subOut}
                                                onChange={(e) => setSubOut(e.target.value)}
                                            >
                                                <option value="">-- Select a Player --</option>
                                                {teams[selectedTeam]?.players.map((player) => (
                                                    <option key={player._id} value={player._id}>
                                                        {player.jerseyNumber} - {player.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="block mt-4 mb-2">Player Substituted In:</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={subIn}
                                                onChange={(e) => setSubIn(e.target.value)}
                                            >
                                                <option value="">-- Select a Player --</option>
                                                {teams[selectedTeam]?.players
                                                    .filter((player) => player._id !== subOut)
                                                    .map((player) => (
                                                        <option key={player._id} value={player._id}>
                                                            {player.jerseyNumber} - {player.name}
                                                        </option>
                                                    ))}
                                            </select>

                                            {/* Add Minute Input Here */}
                                            <label className="block mt-4 mb-2">Minute:</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border rounded-md"
                                                value={minute}
                                                onChange={(e) => setMinute(Number(e.target.value))} // Convert to number
                                                placeholder="Enter minute"
                                            />
                                        </>
                                    )}


                                    {/* Submit Button */}
                                    <button
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
                                        onClick={handleLiveUpdate}
                                        disabled={!updateType || (updateType === "goal" && (!selectedTeam || !goalType || !selectedPlayer))}
                                    >
                                        📌 Submit Live Update
                                    </button>
                                </div>
                            )}

                            {activeTab === "update" && (
                                <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Match Updates</h2>
                                    <div className="space-y-6">
                                        {upcomingMatches.map((match, index) => (
                                            <div key={match._id || index} className="bg-white p-4 rounded-md shadow">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-700">
                                                            {match.homeTeam.name} <span className="text-gray-500">vs</span> {match.awayTeam.name}
                                                        </p>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded-full 
                                                        ${match.status === "upcoming" ? "bg-yellow-100 text-yellow-700" :
                                                                match.status === "live" ? "bg-green-100 text-green-700" :
                                                                    "bg-gray-200 text-gray-700"}`}>
                                                            {match.status}
                                                        </span>
                                                    </div>

                                                    {match.status === "upcoming" && (
                                                        <button
                                                            onClick={() => updateMatchStatus(match._id, "live")}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                                                        >
                                                            Start the Match
                                                        </button>
                                                    )}

                                                    {match.status === "live" && (
                                                        <button
                                                            onClick={() => updateMatchStatus(match._id, "completed")}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                                                        >
                                                            Complete Match
                                                        </button>
                                                    )}
                                                </div>

                                                {/* ✅ Show Player Selection Below Completed Match */}
                                                {match.status === "completed" && (
                                                    <div className="mt-6">
                                                        {submittedMatches.includes(match._id) ? (
                                                            // ✅ Show update confirmation
                                                            <div className="text-green-600 font-semibold">✅ Match Result Updated!</div>
                                                        ) : (
                                                            <>
                                                                <h3 className="text-md font-semibold text-gray-800 mb-2">Select Players Who Played</h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {/* Home Team Players */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">{match.homeTeam.name}</h4>
                                                                        <div className="space-y-2">
                                                                            {match.homeTeam.players.map((player, i) => (
                                                                                <label key={player._id || i} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        value={player._id}
                                                                                        checked={selectedPlayers.includes(player._id)}
                                                                                        onChange={() => handlePlayerSelection(player._id)}
                                                                                        className="w-4 h-4 text-blue-500"
                                                                                    />
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        {player.name} (# {player.jerseyNumber ?? "N/A"})
                                                                                    </span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Away Team Players */}
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">{match.awayTeam.name}</h4>
                                                                        <div className="space-y-2">
                                                                            {match.awayTeam.players.map((player, i) => (
                                                                                <label key={player._id || i} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        value={player._id}
                                                                                        checked={selectedPlayers.includes(player._id)}
                                                                                        onChange={() => handlePlayerSelection(player._id)}
                                                                                        className="w-4 h-4 text-blue-500"
                                                                                    />
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        {player.name} (# {player.jerseyNumber ?? "N/A"})
                                                                                    </span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    onClick={() => submitMatchResult(match._id)}
                                                                    className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                                                                >
                                                                    Submit Match Result
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                        </div>

                    </>
                ) : (
                    <p className="text-gray-600">Tournament not found.</p>
                )
                }
            </div >
        </div >
    );
};

export default CreatedTournamentDetails;
