import { Link } from "react-router-dom";

const TournamentList = ({ title, tournaments }) => {
    return (
        <div className="my-6">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            {tournaments.length > 0 ? (
                <ul>
                    {tournaments.map((tournament) => (
                        <li key={tournament._id} className="bg-white p-4 shadow-md rounded-lg my-2">
                            <Link to={`/tournament/${tournament._id}`} className="text-blue-600 hover:underline">
                                {tournament.name} - {tournament.location}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No tournaments available.</p>
            )}
        </div>
    );
};

export default TournamentList;
