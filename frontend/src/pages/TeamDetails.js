import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const TeamDetails = () => {
    const { tournamentId, teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [matches, setMatches] = useState([]); // Placeholder for match schedule
    const [pointsTable, setPointsTable] = useState([]); // Placeholder for point table
    const [otherTeams, setOtherTeams] = useState([]); // Placeholder for other teams in tournament
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/teams/${teamId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTeam(response.data);
            } catch (error) {
                console.error("Error fetching team details:", error);
                setError("Team not found or an error occurred.");
            }
            setLoading(false);
        };

        // Fetch matches (Placeholder API)
        const fetchMatches = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/matches/team/${teamId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMatches(response.data);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };

        // Fetch points table (Placeholder API)
        const fetchPointsTable = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournament/${tournamentId}/points-table`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPointsTable(response.data);
            } catch (error) {
                console.error("Error fetching points table:", error);
            }
        };

        // Fetch other teams (Placeholder API)
        const fetchOtherTeams = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournament/${tournamentId}/teams`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOtherTeams(response.data);
            } catch (error) {
                console.error("Error fetching other teams:", error);
            }
        };

        fetchTeamDetails();
        fetchMatches();
        fetchPointsTable();
        fetchOtherTeams();
    }, [teamId, tournamentId, token]);

    if (loading) return <p className="text-center text-lg">Loading team details...</p>;
    if (error) return <p className="text-center text-lg text-red-500">{error}</p>;
    if (!team) return <p className="text-center text-lg">Team not found</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">{team.name}</h1>

                {/* Team Details */}
                <div className="mb-6 p-4 bg-blue-100 rounded-lg shadow-md">
                    <p className="text-lg font-semibold">📅 Matches Played: {team.matchesPlayed || 0}</p>
                    <p className="text-lg font-semibold">⚽ Goals Scored: {team.goalsScored || 0}</p>
                    <p className="text-lg font-semibold">🛑 Goals Conceded: {team.goalsConceded || 0}</p>
                    <p className="text-lg font-semibold">🏆 Points: {team.points || 0}</p>
                </div>

                {/* Player List */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">🏃‍♂️ Players List</h2>
                {team.players.length > 0 ? (
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Player Name</th>
                                <th className="px-4 py-2">Matches</th>
                                <th className="px-4 py-2">Goals</th>
                                <th className="px-4 py-2">Assists</th>
                                <th className="px-4 py-2">Yellow Cards</th>
                                <th className="px-4 py-2">Red Cards</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.players.map((player, index) => (
                                <tr key={index} className="text-center border-b">
                                    <td className="px-4 py-2">{player.jerseyNumber}</td>
                                    <td className="px-4 py-2">{player.name}</td>
                                    <td className="px-4 py-2">{player.matchesPlayed}</td>
                                    <td className="px-4 py-2">{player.goals}</td>
                                    <td className="px-4 py-2">{player.assists}</td>
                                    <td className="px-4 py-2">{player.yellowCards}</td>
                                    <td className="px-4 py-2">{player.redCards}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-600">No players registered yet.</p>
                )}

                {/* Match Schedule Placeholder */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">📅 Match Schedule</h2>
                <p className="text-gray-600">Coming soon...</p>

                {/* Points Table Placeholder */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">🏆 Points Table</h2>
                <p className="text-gray-600">Coming soon...</p>

                {/* Live Score Update Placeholder */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">📡 Live Score Updates</h2>
                <p className="text-gray-600">Coming soon...</p>

                {/* Other Teams Placeholder */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">🔍 Other Teams</h2>
                <ul className="list-disc list-inside">
                    {otherTeams.length > 0 ? otherTeams.map((team, index) => (
                        <li key={index} className="text-gray-700">{team.name}</li>
                    )) : <p className="text-gray-600">No other teams available.</p>}
                </ul>

                {/* Assign Captain & Vice-Captain Placeholder */}
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">📝 Assign Captain & Vice-Captain</h2>
                <p className="text-gray-600">Feature coming soon...</p>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-center gap-4">
                    <Link to={`/tournament/${tournamentId}/team/${teamId}/add-players`}>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                            ➕ Add Players
                        </button>
                    </Link>
                    <Link to={`/tournament/${tournamentId}/team/${teamId}/edit`}>
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
                            ✏️ Edit Team
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TeamDetails;
