import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const JoinedTournamentDetails = () => {
    const { tournamentId } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTournamentDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTournament(response.data);
            } catch (error) {
                console.error("Error fetching tournament details:", error);
                setError("Failed to load tournament details.");
            }
            setLoading(false);
        };

        fetchTournamentDetails();
    }, [tournamentId, token]);

    if (loading) return <p className="text-center text-lg">Loading tournament details...</p>;
    if (!tournament) return <p className="text-center text-lg">Tournament not found</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Registered Teams</h1>

                {/* Show Error Message */}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {/* Show Teams */}
                {tournament.teams && tournament.teams.length > 0 ? (
                    <ul className="space-y-3">
                        {tournament.teams.map((team) => (
                            <li key={team._id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                                <Link to={`/tournament/${tournamentId}/team/${team._id}`} className="font-bold text-lg text-blue-600 hover:underline">
                                    {team.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-gray-600">You have not registered any teams for this tournament.</p>
                        <Link to={`/tournament/${tournamentId}/register`}>
                            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                                ➕ Register a Team
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinedTournamentDetails;
