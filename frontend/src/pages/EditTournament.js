import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditTournament = () => {
    const { id: tournamentId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        name: "",
        type: "League",
        faceToFaceMatches: "1",
        numPlayers: "5",
        numSubs: "1",
        numTeams: "",
        matchVenueType: "Single Venue",
        location: "",
        mapLink: "",
        registrationAmount: null,
        registrationStartDate: "",
        registrationCloseDate: "",
        startDate: "",
        rules: "",
    });

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const tournament = response.data;
                setFormData({
                    name: tournament.name || "",
                    type: tournament.type || "League",
                    faceToFaceMatches: tournament.faceToFaceMatches || "1",
                    numPlayers: tournament.numPlayers || "5",
                    numSubs: tournament.numSubs || "1",
                    numTeams: tournament.numTeams || "",
                    matchVenueType: tournament.matchVenueType || "Single Venue",
                    location: tournament.location || "",
                    mapLink: tournament.mapLink || "",
                    registrationAmount: tournament.registrationAmount || null,
                    registrationStartDate: tournament.registrationStartDate ? new Date(tournament.registrationStartDate).toISOString().slice(0, 16) : "",
                    registrationCloseDate: tournament.registrationCloseDate ? new Date(tournament.registrationCloseDate).toISOString().slice(0, 16) : "",
                    startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().split("T")[0] : "",
                    rules: tournament.rules || "",
                });
            } catch (error) {
                console.error("Error fetching tournament:", error);
                alert("Failed to fetch tournament details.");
            }
        };

        fetchTournament();
    }, [tournamentId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/tournaments/${tournamentId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Tournament updated successfully!");
            navigate(`/tournament/created/${tournamentId}`);
        } catch (error) {
            console.error("Error updating tournament:", error);
            alert("Failed to update tournament. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-6">Edit Tournament</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg w-full max-w-2xl">

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Tournament Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>

                    <div>
                        <label className="block mb-2">Tournament Type:</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="League">League</option>
                            <option value="Knockout">Knockout</option>
                            <option value="Group">Group</option>
                        </select>
                    </div>

                    {(formData.type === "League" || formData.type === "Group") && (
                        <div>
                            <label className="block mb-2">Face-to-Face Matches:</label>
                            <select name="faceToFaceMatches" value={formData.faceToFaceMatches} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="1">1 Match</option>
                                <option value="2">2 Matches (Home & Away)</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2">Number of Players Per Team:</label>
                        <select name="numPlayers" value={formData.numPlayers} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="5">5-a-side</option>
                            <option value="6">6-a-side</option>
                            <option value="7">7-a-side</option>
                            <option value="11">11-a-side</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">Number of Substitutes:</label>
                        <select name="numSubs" value={formData.numSubs} onChange={handleChange} className="w-full p-2 border rounded">
                            {[...Array(8)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">Number of Teams:</label>
                        <input type="number" name="numTeams" value={formData.numTeams} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                </div>

                {(formData.type === "League" || formData.type === "Group") && (
                    <div className="mt-4">
                        <label className="block mb-2">Match Venue Type:</label>
                        <select name="matchVenueType" value={formData.matchVenueType} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="Single Venue">Single Venue</option>
                            <option value="Home & Away">Home & Away</option>
                        </select>
                    </div>
                )}

                {formData.matchVenueType === "Single Venue" && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block mb-2">Location:</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>

                        <div>
                            <label className="block mb-2">Map Link:</label>
                            <input type="url" name="mapLink" value={formData.mapLink} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block mb-2">Registration Amount:</label>
                    <input type="number" name="registrationAmount" value={formData.registrationAmount} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block mb-2">Registration Start:</label>
                        <input
                            type="datetime-local"
                            name="registrationStartDate"
                            value={formData.registrationStartDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Registration Close:</label>
                        <input
                            type="datetime-local"
                            name="registrationCloseDate"
                            value={formData.registrationCloseDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block mb-2">Tournament Start Date:</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditTournament;
