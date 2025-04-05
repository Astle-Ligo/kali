import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
                setTournament(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tournament details:", error);
                setLoading(false);
            }
        };
        fetchTournament();
    }, [id]);

    const formatDate = (utcDate) => {
        return new Date(utcDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });
    };

    if (loading) return <p>Loading tournament details...</p>;
    if (!tournament) return <p>Error loading tournament details.</p>;

    // Convert Dates to Readable Format
    const startDate = new Date(tournament.startDate).toLocaleDateString();
    const registrationStart = new Date(tournament.registrationStartDate).toLocaleDateString();
    const registrationClose = new Date(tournament.registrationCloseDate).toLocaleDateString();

    // Check if registration is open
    const now = new Date();
    const isRegistrationOpen = now >= new Date(tournament.registrationStartDate) && now <= new Date(tournament.registrationCloseDate);
    const isRegistrationClosed = now > new Date(tournament.registrationCloseDate);
    const isYetToOpen = now < new Date(tournament.registrationStartDate);

    // Calculate total slots remaining
    const totalSlotsRemaining = tournament.numTeams - tournament.teams.length;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-4">{tournament.name}</h1>

                <div className="space-y-2">
                    <p><strong>Type:</strong> {tournament.type}</p>
                    <p><strong>Face-to-Face Matches:</strong> {tournament.faceToFaceMatches === "2" ? "Home & Away" : "Single Match"}</p>
                    <p><strong>Number of Players:</strong> {tournament.numPlayers} (with {tournament.numSubs} subs)</p>
                    <p><strong>Number of Teams:</strong> {tournament.numTeams}</p>
                    <p><strong>Match Venue Type:</strong> {tournament.matchVenueType}</p>
                    <p><strong>Location:</strong> {tournament.location || "Not provided"}</p>
                    <p><strong>Registration Fee:</strong> ₹{tournament.registrationAmount}</p>
                    <div>Registration Period: {formatDate(tournament.registrationStartDate)} to {formatDate(tournament.registrationCloseDate)}</div>
                    <div>Start Date: {formatDate(tournament.startDate)}</div>
                    <p><strong>Rules:</strong> {tournament.rules || "No rules specified"}</p>
                    <p><strong>Total Slots Remaining:</strong> {totalSlotsRemaining} </p>
                </div>

                {/* Display registration status */}
                <div className="mt-4">
                    {isRegistrationOpen && (
                        <div className="text-green-600 font-bold">Registration is currently open!</div>
                    )}
                    {isRegistrationClosed && (
                        <div className="text-red-600 font-bold">Registration has closed.</div>
                    )}
                    {isYetToOpen && (
                        <div className="text-yellow-600 font-bold">Registration will open on {registrationStart}.</div>
                    )}
                </div>

                {isRegistrationOpen && (
                    <button
                        className="bg-green-500 text-white px-6 py-2 rounded-lg mt-6 hover:bg-green-600 transition w-full"
                        onClick={() => navigate(`/register/${id}`)}
                    >
                        Register Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default TournamentDetails;
