import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateTournament = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        type: "League",
        faceToFaceMatches: "1",
        numPlayers: "5",
        numSubs: "1",
        numTeams: "",  // Set to null for optional fields
        matchVenueType: "Single Venue",
        location: "",
        mapLink: "",
        registrationAmount: null,
        registrationStartDate: "",
        registrationCloseDate: "",
        startDate: "",
        rules: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,  // Keep value as is, including empty strings
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting Form Data:", formData);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("User is not authenticated. Please log in.");
                return;
            }

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            };

            const response = await axios.post("http://localhost:5000/api/tournaments/create", formData, config);
            alert(response.data.message);
            navigate("/");
        } catch (error) {
            console.error("Error Response:", error.response?.data);
            alert(error.response?.data?.message || "Error creating tournament");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-6">Create Tournament</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg w-full max-w-2xl">

                {/* Tournament Details */}
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

                    {/* Face-to-Face Matches */}
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
                        <input type="number" name="numTeams" value={formData.teams} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                </div>

                {/* Match Venue Type */}
                {(formData.type === "League" || formData.type === "Group") && (
                    <div className="mt-4">
                        <label className="block mb-2">Match Venue Type:</label>
                        <select name="matchVenueType" value={formData.matchVenueType} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="Single Venue">Single Venue</option>
                            <option value="Home & Away">Home & Away</option>
                        </select>
                    </div>
                )}

                {/* Location & Map Link */}
                {formData.matchVenueType === "Single Venue" && (formData.type === "League" || formData.type === "Group") && (
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

                {/* Registration Start and Close Date with Time */}
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

                    <div>
                        <label className="block mb-2">Tournament Start:</label>
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

                <div className="mt-4">
                    <label className="block mb-2">Tournament Rules:</label>
                    <textarea name="rules" value={formData.rules} onChange={handleChange} className="w-full p-2 border rounded h-24" required></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">
                    Create Tournament
                </button>
            </form>
        </div>
    );
};

export default CreateTournament;
