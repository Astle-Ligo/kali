import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterTeam = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState("");
    const [managerName, setManagerName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [matchVenueType, setMatchVenueType] = useState(""); // To store tournament venue type
    const [venueName, setVenueName] = useState("");
    const [venueLocation, setVenueLocation] = useState("");

    useEffect(() => {
        const fetchTournamentDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
                setMatchVenueType(response.data.matchVenueType); // Set the venue type
            } catch (error) {
                console.error("Error fetching tournament details:", error);
                alert("Error fetching tournament details.");
            }
        };

        fetchTournamentDetails();
    }, [id]);

    const handleRegisterTeam = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `http://localhost:5000/api/teams/create`,
                {
                    name: teamName,
                    tournamentId: id,
                    manager: managerName,
                    contact: contactNumber,
                    email: email,
                    venueName: matchVenueType === "Home & Away" ? venueName : undefined,
                    venueLocation: matchVenueType === "Home & Away" ? venueLocation : undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Team registered successfully!");
            navigate(`/tournament/${id}`);
        } catch (error) {
            console.error("Error registering team:", error);
            alert("Failed to register team");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-3xl font-bold mb-4">Register Your Team</h2>
            <form onSubmit={handleRegisterTeam} className="bg-white p-6 shadow-md rounded-lg w-96">
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="text"
                    placeholder="Manager Name"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="text"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />

                {/* Show Venue Name & Location only if Match Venue Type is Home & Away */}
                {matchVenueType === "Home & Away" && (
                    <>
                        <input
                            type="text"
                            placeholder="Venue Name"
                            value={venueName}
                            onChange={(e) => setVenueName(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Venue Location"
                            value={venueLocation}
                            onChange={(e) => setVenueLocation(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            required
                        />
                    </>
                )}

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-2 hover:bg-blue-600 transition">
                    Register Team
                </button>
            </form>
        </div>
    );
};

export default RegisterTeam;
