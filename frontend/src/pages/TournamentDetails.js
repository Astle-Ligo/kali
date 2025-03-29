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

    if (loading) return <p>Loading tournament details...</p>;

    const isUpcoming = new Date(tournament.startDate) > new Date();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">{tournament.name}</h1>
            <p><strong>Type:</strong> {tournament.type}</p>
            <p><strong>Location:</strong> {tournament.location}</p>
            <p><strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(tournament.endDate).toLocaleDateString()}</p>

            {isUpcoming && (
                <button
                    className="bg-green-500 text-white px-6 py-2 rounded-lg mt-6 hover:bg-green-600 transition"
                    onClick={() => navigate(`/register/${id}`)}
                >
                    Register
                </button>
            )}
        </div>
    );
};

export default TournamentDetails;
