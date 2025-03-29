import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreatedTournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [activeTab, setActiveTab] = useState("teams"); // Default tab

    useEffect(() => {
        const fetchTournamentDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTournament(response.data);
            } catch (error) {
                console.error("Error fetching tournament details:", error);
            }
            setLoading(false);
        };

        fetchTournamentDetails();
    }, [id, token]);

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

    if (loading) return <p>Loading tournament details...</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                {tournament ? (
                    <>
                        {/* Tournament Details */}
                        <h1 className="text-3xl font-bold mb-4">{tournament.name}</h1>
                        <p className="text-gray-700">📍 Location: {tournament.location}</p>
                        <p className="text-gray-700">📅 Date: {tournament.startDate}</p>
                        <p className="text-gray-700">🛠 Format: {tournament.format}</p>
                        <p className="text-gray-700">📝 Status: {tournament.status}</p>
                        <p className="text-gray-700">
                            🏆 Teams Registered: {tournament.teams.length}
                        </p>

                        {/* Navigation Tabs */}
                        <div className="flex justify-between border-b mt-6">
                            {["teams", "stats", "results", "schedule", "live", "entry"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 w-full text-center ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
                                        }`}
                                >
                                    {tab === "teams" && "Registered Teams"}
                                    {tab === "stats" && "Overall Stats"}
                                    {tab === "results" && "Match Results"}
                                    {tab === "schedule" && "Schedule"}
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

                            {activeTab === "stats" && (
                                <p className="text-gray-700">📊 Overall statistics will be displayed here.</p>
                            )}

                            {activeTab === "results" && (
                                <p className="text-gray-700">📋 Match results will be displayed here.</p>
                            )}

                            {activeTab === "schedule" && (
                                <p className="text-gray-700">📅 Match schedule will be displayed here.</p>
                            )}

                            {activeTab === "live" && (
                                <p className="text-gray-700">🎥 Live updates will be displayed here.</p>
                            )}

                            {activeTab === "entry" && (
                                <p className="text-gray-700">📝 Result entry form will be displayed here.</p>
                            )}
                        </div>

                        {/* Organizer Options */}
                        <div className="mt-6">
                            <button
                                onClick={handleEditTournament}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-3"
                            >
                                ✏️ Edit Tournament
                            </button>
                            {tournament.registrationOpen && (
                                <button
                                    onClick={handleCloseRegistration}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                                >
                                    🚫 Close Registration
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-600">Tournament not found.</p>
                )}
            </div>
        </div>
    );
};

export default CreatedTournamentDetails;
