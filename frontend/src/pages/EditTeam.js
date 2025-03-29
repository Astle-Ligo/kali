import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditTeam = () => {
    const { teamId } = useParams();
    const navigate = useNavigate(); // Initialize navigate here
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
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
            }
            setLoading(false);
        };

        fetchTeamDetails();
    }, [teamId, token]);

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/teams/${teamId}`,
                team,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Team updated successfully!");
            // Navigate back to the tournament details page
            navigate(`/tournament/${team.tournament}`);
        } catch (error) {
            console.error("Error updating team:", error);
        }
    };

    const handlePlayerChange = (index, value) => {
        const updatedPlayers = [...team.players];
        updatedPlayers[index] = value;
        setTeam({ ...team, players: updatedPlayers });
    };

    const addPlayer = () => {
        setTeam({ ...team, players: [...team.players, ""] });
    };

    const removePlayer = (index) => {
        const updatedPlayers = team.players.filter((_, i) => i !== index);
        setTeam({ ...team, players: updatedPlayers });
    };

    if (loading) return <p className="text-center text-lg">Loading team details...</p>;
    if (!team) return <p className="text-center text-lg">Team not found</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Edit Team</h1>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div>
                        <label className="block font-semibold">Team Name</label>
                        <input
                            type="text"
                            value={team.name}
                            onChange={(e) => setTeam({ ...team, name: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Manager</label>
                        <input
                            type="text"
                            value={team.manager}
                            onChange={(e) => setTeam({ ...team, manager: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Contact</label>
                        <input
                            type="text"
                            value={team.contact}
                            onChange={(e) => setTeam({ ...team, contact: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Email</label>
                        <input
                            type="email"
                            value={team.email}
                            onChange={(e) => setTeam({ ...team, email: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    {/* Players List */}
                    <div>
                        <label className="block font-semibold">Players</label>
                        {team.players.map((player, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={player}
                                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removePlayer(index)}
                                    className="ml-2 bg-red-500 text-white px-2 rounded-md hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPlayer}
                            className="mt-2 bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                        >
                            Add Player
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeam;
