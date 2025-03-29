import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddPlayer = () => {
    const { tournamentId, teamId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [tournament, setTournament] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tournament details
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`);
                setTournament(response.data);
            } catch (err) {
                console.error("Error fetching tournament:", err);
                setError("Tournament not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [tournamentId]);

    // Initialize players after fetching tournament data
    useEffect(() => {
        if (tournament) {
            const mainPlayersCount = tournament.numPlayers ?? 11; // Default 11 main players
            const subPlayersCount = tournament.numSubs ?? 8; // Default 8 substitutes
            const totalPlayers = mainPlayersCount + subPlayersCount;

            setPlayers(
                Array.from({ length: totalPlayers }, (_, index) => ({
                    name: "",
                    jerseyNumber: "",
                    position: "",
                    type: index < mainPlayersCount ? "main" : "sub",
                }))
            );
        }
    }, [tournament]);

    if (loading) return <p className="text-center text-lg">Loading tournament details...</p>;
    if (error) return <p className="text-center text-lg text-red-500">{error}</p>;
    if (!tournament) return <p className="text-center text-lg">Tournament not found</p>;

    const handlePlayerChange = (index, field, value) => {
        const updatedPlayers = [...players];
        updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
        setPlayers(updatedPlayers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/teams/${teamId}/add-player`, // ✅ Matches backend route
                { players },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/tournament/${tournamentId}/team/${teamId}`);
        } catch (err) {
            console.error("Error adding players:", err);
            setError("Failed to add players. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
            <div className="max-w-2xl bg-white shadow-lg rounded-lg p-6 w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">➕ Add Players</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {players.map((player, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded-md ${player.type === "main" ? "bg-blue-100" : "bg-yellow-100"}`}
                        >
                            <h3 className="font-semibold">
                                {player.type === "main" ? "⚽ Main Player" : "🔄 Substitute"} #{index + 1}
                            </h3>

                            <input
                                type="text"
                                placeholder="Player Name"
                                value={player.name}
                                onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                                required={player.type === "main"}
                                className="w-full p-2 border rounded-md mt-2"
                            />
                            <input
                                type="number"
                                placeholder="Jersey Number"
                                value={player.jerseyNumber}
                                onChange={(e) => handlePlayerChange(index, "jerseyNumber", e.target.value)}
                                required={player.type === "main"}
                                className="w-full p-2 border rounded-md mt-2"
                            />

                            {/* Player Position Dropdown */}
                            <select
                                value={player.position}
                                onChange={(e) => handlePlayerChange(index, "position", e.target.value)}
                                required={player.type === "main"}
                                className="w-full p-2 border rounded-md mt-2 bg-white"
                            >
                                <option value="" disabled>Select Position</option>
                                <option value="Forward">Forward</option>
                                <option value="Midfielder">Midfielder</option>
                                <option value="Defender">Defender</option>
                                <option value="Goalkeeper">Goalkeeper</option>
                            </select>
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 mt-4"
                        disabled={loading}
                    >
                        {loading ? "Adding Players..." : "Add Players"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPlayer;
