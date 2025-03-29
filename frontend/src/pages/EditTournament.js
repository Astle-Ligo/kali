import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditTournament = () => {
    const { id: tournamentId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [tournamentName, setTournamentName] = useState("");
    const [tournamentLocation, setTournamentLocation] = useState("");
    const [tournamentStartDate, setTournamentStartDate] = useState("");
    const [tournamentEndDate, setTournamentEndDate] = useState("");
    const [tournamentFormat, setTournamentFormat] = useState("");
    const [tournamentStatus, setTournamentStatus] = useState("");
    const [tournamentType, setTournamentType] = useState("");
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tournament details
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const tournament = response.data;
                setTournamentName(tournament.name);
                setTournamentLocation(tournament.location);
                setTournamentStartDate(tournament.startDate.split("T")[0]); // Format date
                setTournamentEndDate(tournament.endDate.split("T")[0]); // Format date
                setTournamentFormat(tournament.type); // Assuming 'type' is the format
                setTournamentStatus(tournament.status);
                setTeams(tournament.teams.map(team => team.$oid)); // Store team IDs
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tournament:", error);
                setError("Failed to fetch tournament details.");
                setLoading(false);
            }
        };

        fetchTournament();
    }, [tournamentId, token]);

    // Handle tournament update
    const handleSaveChanges = async (e) => {
        e.preventDefault();

        const updatedData = {
            name: tournamentName,
            location: tournamentLocation,
            startDate: tournamentStartDate,
            endDate: tournamentEndDate,
            format: tournamentFormat,
            status: tournamentStatus,
            teams: teams, // Send updated team IDs if necessary
        };

        try {
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Tournament updated successfully!");
            navigate(`/tournament/created/${tournamentId}`);
        } catch (error) {
            console.error("Error updating tournament:", error);
            setError("Failed to update tournament. Please try again.");
        }
    };

    if (loading) return <p className="text-center text-lg">Loading tournament details...</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
            <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Tournament</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div>
                        <label className="block font-semibold">Tournament Name</label>
                        <input
                            type="text"
                            value={tournamentName}
                            onChange={(e) => setTournamentName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Location</label>
                        <input
                            type="text"
                            value={tournamentLocation}
                            onChange={(e) => setTournamentLocation(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Start Date</label>
                        <input
                            type="date"
                            value={tournamentStartDate}
                            onChange={(e) => setTournamentStartDate(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">End Date</label>
                        <input
                            type="date"
                            value={tournamentEndDate}
                            onChange={(e) => setTournamentEndDate(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Format</label>
                        <select
                            value={tournamentFormat}
                            onChange={(e) => setTournamentFormat(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        >
                            <option value="">Select Format</option>
                            <option value="Knockout">Knockout</option>
                            <option value="League">League</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold">Status</label>
                        <input
                            type="text"
                            value={tournamentStatus}
                            onChange={(e) => setTournamentStatus(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/tournament/created/${tournamentId}`)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTournament;
