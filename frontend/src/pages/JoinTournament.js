import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const JoinTournament = () => {
    const [tournaments, setTournaments] = useState({
        upcoming: [],
        ongoing: [],
        completed: []
    });

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/tournaments");
                const currentDate = new Date();

                const categorizedTournaments = {
                    upcoming: [],
                    ongoing: [],
                    completed: []
                };

                response.data.forEach(tournament => {
                    const startDate = new Date(tournament.startDate);
                    const endDate = new Date(tournament.endDate);

                    if (currentDate < startDate) {
                        categorizedTournaments.upcoming.push(tournament);
                    } else if (currentDate >= startDate && currentDate <= endDate) {
                        categorizedTournaments.ongoing.push(tournament);
                    } else {
                        categorizedTournaments.completed.push(tournament);
                    }
                });

                setTournaments(categorizedTournaments);
            } catch (error) {
                console.error("Error fetching tournaments:", error);
            }
        };
        fetchTournaments();
    }, []);

    const renderTournamentSection = (title, tournaments) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {tournaments.length > 0 ? (
                <ul className="space-y-2">
                    {tournaments.map(tournament => (
                        <li key={tournament._id} className="p-4 bg-white shadow rounded-lg">
                            <Link to={`/tournament/${tournament._id}`} className="text-blue-600 hover:underline font-semibold">
                                {tournament.name}
                            </Link>
                            <p className="text-sm text-gray-500">Location: {tournament.location}</p>
                            <p className="text-sm text-gray-500">Start Date: {new Date(tournament.startDate).toDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No {title.toLowerCase()} tournaments available</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Join a Tournament</h1>
            {renderTournamentSection("Upcoming Tournaments", tournaments.upcoming)}
            {renderTournamentSection("Ongoing Tournaments", tournaments.ongoing)}
            {renderTournamentSection("Completed Tournaments", tournaments.completed)}
        </div>
    );
};

export default JoinTournament;
