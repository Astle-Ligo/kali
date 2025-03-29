import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token); // Check if token exists
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Navbar */}
            <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Football Tournament Organizer</h1>
                <div className="space-x-4">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                                Login
                            </Link>
                            <Link to="/signup" className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <h1 className="text-4xl font-bold mb-6">Welcome to Football Tournament Organizer</h1>

                <div className="space-y-4">
                    <Link to="/create-tournament" className="px-6 py-3 bg-blue-500 text-white rounded-lg">
                        Create Tournament
                    </Link>

                    <Link to="/join-tournament" className="px-6 py-3 bg-green-500 text-white rounded-lg">
                        Join Tournament
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
