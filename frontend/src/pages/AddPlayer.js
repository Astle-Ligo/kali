import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddPlayer = () => {
    const { tournamentId, teamId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [tournament, setTournament] = useState(null);
    const [players, setPlayers] = useState([]);
    const [captain, setCaptain] = useState(null);
    const [viceCaptain, setViceCaptain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (tournament) {
            const mainPlayersCount = tournament.numPlayers ?? 11;
            const subPlayersCount = tournament.numSubs ?? 8;
            const totalPlayers = mainPlayersCount + subPlayersCount;

            setPlayers(
                Array.from({ length: totalPlayers }, (_, index) => ({
                    name: "",
                    jerseyNumber: "",
                    position: "",
                    type: index < mainPlayersCount ? "main" : "sub",
                    isCaptain: false,
                    isViceCaptain: false,
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

    const handleCaptainChange = (playerIndex) => {
        if (viceCaptain === playerIndex) {
            setViceCaptain(null); // Remove as vice-captain if selected as captain
        }
        setCaptain(playerIndex === captain ? null : playerIndex);
    };

    const handleViceCaptainChange = (playerIndex) => {
        if (captain === playerIndex) {
            setCaptain(null); // Remove as captain if selected as vice-captain
        }
        setViceCaptain(playerIndex === viceCaptain ? null : playerIndex);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Update players list to include isCaptain and isViceCaptain
        const updatedPlayers = players.map((player, index) => ({
            ...player,
            isCaptain: index === captain,      // Set true if this player is the captain
            isViceCaptain: index === viceCaptain, // Set true if this player is the vice-captain
        }));

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/teams/${teamId}/add-player`,
                {
                    players: updatedPlayers,  // Send modified players list
                },
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
            <div className="max-w-4xl bg-white shadow-lg rounded-lg p-6 w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">➕ Add Players</h1>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Jersey Number</th>
                                <th className="px-4 py-2">Player Name</th>
                                <th className="px-4 py-2">Position</th>
                                <th className="px-4 py-2">Captain</th>
                                <th className="px-4 py-2">Vice-Captain</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr
                                    key={index}
                                    className={`text-center border-b ${player.type === "main" ? "bg-blue-100" : "bg-yellow-100"
                                        }`}
                                >
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={player.jerseyNumber}
                                            onChange={(e) => handlePlayerChange(index, "jerseyNumber", e.target.value)}
                                            required={player.type === "main"}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={player.name}
                                            onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                                            required={player.type === "main"}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={player.position}
                                            onChange={(e) => handlePlayerChange(index, "position", e.target.value)}
                                            required={player.type === "main"}
                                            className="w-full p-2 border rounded-md bg-white"
                                        >
                                            <option value="" disabled>Select Position</option>
                                            <option value="Forward">Forward</option>
                                            <option value="Midfielder">Midfielder</option>
                                            <option value="Defender">Defender</option>
                                            <option value="Goalkeeper">Goalkeeper</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="radio"
                                            name="captain"
                                            checked={captain === index}
                                            onChange={() => handleCaptainChange(index)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="radio"
                                            name="viceCaptain"
                                            checked={viceCaptain === index}
                                            onChange={() => handleViceCaptainChange(index)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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

