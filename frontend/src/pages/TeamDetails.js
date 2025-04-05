import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const TeamDetails = () => {
    const { tournamentId, teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [matches, setMatches] = useState([]);
    const [pointsTable, setPointsTable] = useState([]);
    const [otherTeams, setOtherTeams] = useState([]);
    const [liveScore, setLiveScore] = useState(null);
    const [showOtherTeams, setShowOtherTeams] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const [teamNames, setTeamNames] = useState({}); // New state to store team names
    const [players, setPlayers] = useState([])

    useEffect(() => {
        const fetchTeamDetails = async () => {
            setTeam(null); // Reset team state before fetching
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data) {
                    setTeam(response.data);
                    fetchPlayers(response.data.players); // ✅ Fetch players separately

                } else {
                    console.error("No team data received.");
                }
            } catch (error) {
                console.error("Error fetching team details:", error);
                setError("Team not found or an error occurred.");
            }
        };

        const fetchPlayers = async (playerIds) => {
            if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
                console.log("No valid player IDs found.");
                setPlayers([]);
                return;
            }

            // Extracting only the ID strings
            const ids = playerIds.map(player => player.$oid || player._id || player).filter(id => typeof id === "string");

            console.log("Fetching Players with IDs:", ids);

            try {
                const responses = await Promise.all(
                    ids.map((id) =>
                        axios.get(`${process.env.REACT_APP_API_URL}/api/players/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    )
                );

                const playerData = responses.map((res) => res.data);
                setPlayers(playerData);
            } catch (error) {
                console.error("Error fetching players:", error);
                setPlayers([]);
            }
        };


        const fetchMatches = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data) {
                    const fetchedMatches = response.data.matches || [];
                    setMatches(fetchedMatches);

                    // Calculate points table right after fetching matches
                    calculatePointsTable(fetchedMatches);

                    // Fetch team names for each match
                    const teamIds = fetchedMatches.flatMap(match => [match.homeTeam, match.awayTeam]);
                    const uniqueTeamIds = [...new Set(teamIds)]; // Get unique team IDs

                    // Fetch each team's details
                    const teamResponses = await Promise.all(uniqueTeamIds.map(id =>
                        axios.get(`${process.env.REACT_APP_API_URL}/api/teams/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                    ));

                    // Store team names in the state
                    const names = {};
                    teamResponses.forEach(res => {
                        names[res.data._id] = res.data.name;
                    });
                    setTeamNames(names);
                } else {
                    console.error("No data received from API.");
                }
            } catch (error) {
                console.error("Error fetching tournament matches:", error.response ? error.response.data : error.message);
                setError("Failed to fetch matches.");
            } finally {
                setLoading(false); // Ensure loading stops
            }
        };

        fetchTeamDetails();
        fetchMatches();
    }, [teamId, tournamentId, token]);

    const calculatePointsTable = (matches) => {
        const points = {};

        matches.forEach((match) => {
            const homeTeamId = match.homeTeam; // Use homeTeam directly
            const awayTeamId = match.awayTeam; // Use awayTeam directly
            const homeScore = match.score.home || 0; // Adjust according to your score structure
            const awayScore = match.score.away || 0;

            // Initialize teams in the points table if not already done
            if (!points[homeTeamId]) points[homeTeamId] = { points: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0 };
            if (!points[awayTeamId]) points[awayTeamId] = { points: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0 };

            // Update goals scored and conceded
            points[homeTeamId].goalsFor += homeScore;
            points[homeTeamId].goalsAgainst += awayScore;
            points[awayTeamId].goalsFor += awayScore;
            points[awayTeamId].goalsAgainst += homeScore;

            // Update matches played
            points[homeTeamId].matchesPlayed += 1;
            points[awayTeamId].matchesPlayed += 1;

            // Determine points based on the score
            if (homeScore > awayScore) {
                points[homeTeamId].points += 3; // Home team wins
                points[homeTeamId].wins += 1;
                points[awayTeamId].losses += 1;
            } else if (awayScore > homeScore) {
                points[awayTeamId].points += 3; // Away team wins
                points[awayTeamId].wins += 1;
                points[homeTeamId].losses += 1;
            } else {
                points[homeTeamId].points += 1; // Draw
                points[awayTeamId].points += 1; // Draw
                points[homeTeamId].draws += 1;
                points[awayTeamId].draws += 1;
            }
        });

        // Convert points object to an array for easier rendering
        setPointsTable(Object.entries(points).map(([teamId, stats]) => ({ teamId, ...stats })));
    };


    if (loading) return <p className="text-center text-lg">Loading team details...</p>;
    if (error) return <p className="text-center text-lg text-red-500">{error}</p>;
    if (!team) return <p className="text-center text-lg">Team not found</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex gap-6">
            {/* Left Sidebar - Match Schedule */}
            <aside className="w-1/4 bg-white shadow-lg p-4 sticky top-24 h-fit rounded-lg">
                <h2 className="text-lg font-bold mb-3">📅 Match Schedule</h2>

                {loading ? (
                    <p className="text-gray-600">Loading matches...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : matches.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700">
                        {matches.map((match, index) => {
                            // Check if the match involves the own team
                            const isOwnTeamHome = match.homeTeam === team._id;
                            const isOwnTeamAway = match.awayTeam === team._id;

                            return (
                                <li
                                    key={index}
                                    className={`mb-2 ${isOwnTeamHome || isOwnTeamAway ? "text-green-600 font-bold" : "text-gray-700"
                                        }`} // Highlight own team match with specific color
                                >
                                    {new Date(match.date).toLocaleDateString()} -{" "}
                                    <span className={isOwnTeamHome ? "text-green-600" : "text-gray-700"}>
                                        {teamNames[match.homeTeam] || "Loading..."}
                                    </span>{" "}
                                    vs{" "}
                                    <span className={isOwnTeamAway ? "text-green-600" : "text-gray-700"}>
                                        {teamNames[match.awayTeam] || "Loading..."}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-600">No matches scheduled.</p>
                )}
            </aside>

            {/* Main Content */}
            <main className="w-1/2 bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-4 text-center">{team.name}</h1>

                {/* Team Details */}
                <div className="mb-6 p-4 bg-blue-100 rounded-lg shadow-md">
                    <p className="text-lg font-semibold">📅 Matches Played: {team.matchesPlayed || 0}</p>
                    <p className="text-lg font-semibold">⚽ Goals Scored: {team.goalsScored || 0}</p>
                    <p className="text-lg font-semibold">🛑 Goals Conceded: {team.goalsConceded || 0}</p>
                    <p className="text-lg font-semibold">🏆 Points: {team.points || 0}</p>
                </div>

                {/* Edit Team Button */}
                <Link to={`/edit-team/${teamId}`}>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 w-full mb-4">
                        ✏️ Edit Team
                    </button>
                </Link>

                {/* Player List */}
                <h2 className="text-xl font-semibold mb-3">🏃‍♂️ Players</h2>
                {team.players ? (
                    <div className="border rounded-lg">
                        <table className="w-full bg-white shadow-md">
                            <thead className="bg-gray-300">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Matches</th>
                                    <th className="px-4 py-2">Goals</th>
                                    <th className="px-4 py-2">Assists</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(players) && players.length > 0 ? (
                                    players.map((player, index) => (
                                        <tr key={player._id || index} className="text-center border-b">
                                            <td className="px-4 py-2">{player.jerseyNumber}</td>
                                            <td className="px-4 py-2">{player.name}</td>
                                            <td className="px-4 py-2">{player.matchesPlayed}</td>
                                            <td className="px-4 py-2">{player.goals}</td>
                                            <td className="px-4 py-2">{player.assists}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-2 text-gray-500">No players available.</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No players registered yet.</p>
                )}

                {/* Add Player Button - Only if no players exist */}
                {(Array.isArray(team?.players) && team.players.length === 0) && (
                    <Link to={`/tournament/${tournamentId}/team/${teamId}/add-players`}>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full mt-4">
                            ➕ Add Player
                        </button>
                    </Link>
                )}
            </main>

            {/* Right Sidebar - Points Table */}
            <aside className="w-1/4 bg-white shadow-lg p-4 sticky top-24 h-fit rounded-lg">
                <h2 className="text-lg font-bold mb-3">🏆 Points Table</h2>
                {pointsTable.length > 0 ? (
                    <table className="w-full bg-white shadow-md">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-4 py-2">Position</th>
                                <th className="px-4 py-2">Team</th>
                                <th className="px-4 py-2">MP</th>
                                <th className="px-4 py-2">W</th>
                                <th className="px-4 py-2">L</th>
                                <th className="px-4 py-2">D</th>
                                <th className="px-4 py-2">GF</th>
                                <th className="px-4 py-2">GA</th>
                                <th className="px-4 py-2">PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pointsTable
                                .sort((a, b) => b.points - a.points) // Sort by points
                                .map(({ teamId, points, matchesPlayed, goalsFor, goalsAgainst, wins, losses, draws }, index) => (
                                    <tr key={teamId} className={`text-center border-b ${teamId === team._id ? "bg-yellow-100" : ""}`}>
                                        <td className="px-4 py-2">{index + 1}</td> {/* Position */}
                                        <td className="px-4 py-2">{teamNames[teamId] || "Unknown Team"}</td>
                                        <td className="px-4 py-2">{matchesPlayed}</td>
                                        <td className="px-4 py-2">{wins}</td>
                                        <td className="px-4 py-2">{losses}</td>
                                        <td className="px-4 py-2">{draws}</td>
                                        <td className="px-4 py-2">{goalsFor}</td>
                                        <td className="px-4 py-2">{goalsAgainst}</td>
                                        <td className="px-4 py-2">{points}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No points data available.</p>
                )}
            </aside>

        </div>
    );
};

export default TeamDetails;
