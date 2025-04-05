import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditTeam = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Fetched Team Data:", response.data); // 🔍 Check this log
                setTeam(response.data);
            } catch (err) {
                setError("Failed to fetch team details.");
                console.error("Error fetching team details:", err);
            }
            setLoading(false);
        };

        fetchTeam();
    }, [teamId, token]);


    useEffect(() => {
        const fetchTournament = async () => {
            if (!team?.tournament) {  // ✅ Fix: Use `team.tournament` instead of `team.tournamentId`
                console.error("No tournamentId found for this team.");
                return;
            }

            try {
                console.log("Fetching tournament for ID:", team.tournament);
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${team.tournament}`,  // ✅ Fix: Use `team.tournament`
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Tournament Data:", response.data);
                setTournament(response.data);
            } catch (err) {
                console.error("Error fetching tournament details:", err);
            }
        };


        if (team) fetchTournament();
    }, [team, token]);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTeam((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlayerChange = (index, field, value) => {
        const updatedPlayers = [...team.players];
        updatedPlayers[index][field] = value;
        setTeam((prev) => ({ ...prev, players: updatedPlayers }));
    };

    // Ensure only one captain is selected
    const handleCaptainSelection = (selectedIndex) => {
        const updatedPlayers = team.players.map((player, index) => ({
            ...player,
            isCaptain: index === selectedIndex, // Set selected player as captain
            isViceCaptain: player.isCaptain ? false : player.isViceCaptain, // Remove captain role from the previous captain
        }));
        setTeam((prev) => ({ ...prev, players: updatedPlayers }));
    };

    // Ensure only one vice-captain is selected
    const handleViceCaptainSelection = (selectedIndex) => {
        const updatedPlayers = team.players.map((player, index) => ({
            ...player,
            isViceCaptain: index === selectedIndex, // Set selected player as vice-captain
            isCaptain: player.isViceCaptain ? false : player.isCaptain, // Remove vice-captain role from the previous vice-captain
        }));
        setTeam((prev) => ({ ...prev, players: updatedPlayers }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting team update:", team); // 🔍 Debugging log

        if (team.players.length < tournament?.numPlayers) {
            alert(`Your team must have at least ${tournament?.numPlayers} players before saving.`);
            return;
        }

        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, team, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Update response:", response.data); // 🔍 Debugging log

            navigate(`/tournament/${team.tournamentId}/team/${team._id}`);
        } catch (err) {
            console.error("Error updating team:", err.response?.data || err.message);
            setError("Failed to update team.");
        }
    };

    const handleAddPlayer = () => {
        if (team.players.length >= (tournament?.numPlayers + tournament?.numSubs)) return;

        setTeam((prev) => ({
            ...prev,
            players: [
                ...prev.players,
                { _id: Date.now(), name: "", jerseyNumber: "", position: "Forward", isCaptain: false, isViceCaptain: false },
            ],
        }));
    };

    const handleDeletePlayer = (index) => {
        const updatedPlayers = team.players.filter((_, i) => i !== index);
        setTeam((prev) => ({ ...prev, players: updatedPlayers }));
    };



    if (loading) return <p className="text-center text-lg">Loading...</p>;
    if (error) return <p className="text-center text-lg text-red-500">{error}</p>;
    if (!team) return <p className="text-center text-lg">Team not found</p>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen flex justify-center">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-11/12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-4 text-center">Edit Team</h1>

                {/* Team Details */}
                <div className="mb-4">
                    <label className="block font-semibold">Team Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={team.name}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Manager:</label>
                    <input
                        type="text"
                        name="manager"
                        value={team.manager}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Contact:</label>
                    <input
                        type="text"
                        name="contact"
                        value={team.contact}
                        onChange={handleInputChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                {/* Player Details */}
                <h2 className="text-xl font-semibold mb-3">Edit Players</h2>

                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="px-4 py-2">#</th>
                            <th className="px-4 py-2">Jersey Number</th>
                            <th className="px-4 py-2">Player Name</th>
                            <th className="px-4 py-2">Position</th>
                            <th className="px-4 py-2">Captain</th>
                            <th className="px-4 py-2">Vice-Captain</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.players.map((player, index) => {
                            const isMain = index < tournament?.numPlayers;
                            return (
                                <tr key={player._id} className={`text-center border-b ${isMain ? "bg-blue-100" : "bg-gray-300"}`}>
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={player.jerseyNumber}
                                            onChange={(e) => handlePlayerChange(index, "jerseyNumber", e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={player.name}
                                            onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={player.position}
                                            onChange={(e) => handlePlayerChange(index, "position", e.target.value)}
                                            className="w-full p-2 border rounded-md bg-white"
                                        >
                                            <option value="Forward">Forward</option>
                                            <option value="Midfielder">Midfielder</option>
                                            <option value="Defender">Defender</option>
                                            <option value="Goalkeeper">Goalkeeper</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input type="radio" name="captain" checked={player.isCaptain} onChange={() => handleCaptainSelection(index)} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input type="radio" name="viceCaptain" checked={player.isViceCaptain} onChange={() => handleViceCaptainSelection(index)} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <button className="bg-red-500 text-white px-2 py-1 rounded-md" onClick={() => handleDeletePlayer(index)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full mt-4"
                    onClick={handleAddPlayer}
                    disabled={team.players.length >= (tournament?.numPlayers + tournament?.numSubs)}
                >
                    + Add Player
                </button>

                {/* Submit Button */}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full mt-4">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditTeam;
