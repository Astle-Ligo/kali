import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [createdTournaments, setCreatedTournaments] = useState([]);
    const [joinedTournaments, setJoinedTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            console.log("No token found, redirecting to login...");
            navigate("/login");
            return;
        }

        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/auth/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUser(userResponse.data);

                console.log("Fetching tournaments...");
                const createdResponse = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/my-tournaments`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log("✅ Raw Created Response:", createdResponse.data);

                setCreatedTournaments(createdResponse.data.createdTournaments || []);
                setJoinedTournaments(createdResponse.data.registeredTournaments || []);

                console.log("🔎 After state update - Created Tournaments:", createdResponse.data.createdTournaments);
                console.log("🔎 After state update - Joined Tournaments:", createdResponse.data.registeredTournaments);

            } catch (error) {
                console.error("🔥 Error fetching data", error);
                if (error.response?.status === 401) {
                    console.log("Unauthorized - Removing token and redirecting...");
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
            setLoading(false);
        };


        fetchUserData();
    }, [token, navigate]);

    // Navigate to created tournament details
    const handleCreatedTournamentClick = (tournamentId) => {
        navigate(`/tournament/created/${tournamentId}`);
    };


    if (loading) return <p className="text-center text-lg">Loading dashboard...</p>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">🏆 Your Tournament Dashboard</h1>

                {/* User Info */}
                {user && (
                    <div className="mb-6 p-6 bg-blue-100 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-blue-800">👋 Welcome, {user.name}!</h2>
                        <p className="text-gray-700">📧 Email: {user.email}</p>
                        <p className="text-gray-700">🔹 Role: {user.role || "Player"}</p>
                    </div>
                )}

                {/* Created Tournaments Section */}
                <h2 className="text-xl font-semibold mb-3 text-gray-800">🎯 Tournaments You Created</h2>
                {createdTournaments.length > 0 ? (
                    <ul className="mb-6 space-y-3">
                        {createdTournaments.map((tournament) => (
                            <li
                                key={tournament._id}
                                onClick={() => handleCreatedTournamentClick(tournament._id)}
                                className="p-4 bg-gray-200 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-300 transition duration-200"
                            >
                                <span className="font-medium">{tournament.name}</span>
                                <span className="text-gray-600">{tournament.status}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 mb-6">⚠️ You haven't created any tournaments yet.</p>
                )}

                {/* Joined Tournaments Section */}
                <h2 className="text-xl font-semibold mb-3 text-gray-800">🔗 Tournaments You Joined</h2>
                {joinedTournaments.length > 0 ? (
                    <ul className="space-y-3">
                        {joinedTournaments.map((tournament) => (
                            <li
                                key={tournament._id}
                                className="p-4 bg-green-200 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-green-300 transition"
                            >
                                <Link to={`/joined-tournament/${tournament._id}`} className="w-full flex justify-between">
                                    <span className="font-medium">{tournament.name}</span>
                                    <span className="text-gray-600">{tournament.status}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">🚀 You haven't joined any tournaments yet.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
