import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, Shield, ChevronRight, Trophy as TrophyIcon, Star, ArrowRight } from 'lucide-react';


const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="https://www.fcbarcelona.com/fcbarcelona/photo/2018/06/05/999852e5-16ab-44db-98b2-48d28823224e/oeNpBNJV.jpg"
            alt="Football stadium"
            className="w-full h-[700px] object-cover"
          />
        </div>

        {/* Navbar */}
        <nav className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-full p-2">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-white">BRAZUCA</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-green-300 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white hover:text-green-300 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div className="relative z-20 container mx-auto px-6 py-32">
          <div className="max-w-3xl text-white">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Manage Football Tournaments Effortlessly
            </h1>
            <p className="text-xl text-gray-200 mb-10 leading-relaxed">
              BRAZUCA makes it easy to create, join, and run tournaments—whether
              you're managing a casual local league or a major event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/create-tournament"
                className="bg-green-500 text-white px-8 py-4 rounded-full hover:bg-green-600 transition flex items-center shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
              >
                Create Tournament <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/join-tournament"
                className="bg-white text-green-600 px-8 py-4 rounded-full hover:bg-green-100 transition flex items-center shadow"
              >
                Join Tournament <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Features Section */}
      <section id="features" className="py-32 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">Everything You Need to Run Tournaments</h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Powerful tools that make tournament management a breeze, from registration to final whistle.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition group">
            <div className="bg-green-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Tournament Management</h3>
            <p className="text-gray-600 mb-6">
              Create and manage tournaments with flexible formats, from knockout to league systems.
            </p>
            <a href="#" className="text-green-600 font-medium flex items-center group-hover:text-green-700">
              Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition group">
            <div className="bg-green-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Team Registration</h3>
            <p className="text-gray-600 mb-6">
              Easy team registration process with custom fields and automatic group assignments.
            </p>
            <a href="#" className="text-green-600 font-medium flex items-center group-hover:text-green-700">
              Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition group">
            <div className="bg-green-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Fixture Scheduling</h3>
            <p className="text-gray-600 mb-6">
              Automated fixture generation with smart scheduling to avoid conflicts.
            </p>
            <a href="#" className="text-green-600 font-medium flex items-center group-hover:text-green-700">
              Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-green-600 transform -skew-y-6" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <Shield className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Revolutionize Your Tournament Management?
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto">

              Start your journey today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-white text-green-600 px-8 py-4 rounded-full hover:bg-green-50 transition shadow-lg w-full sm:w-auto">
                Let's Start
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-white rounded-full p-2">
                  <TrophyIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xl font-bold">BRAZUCA</span>
              </div>
              <p className="text-gray-400 mb-6">
                Making tournament organization simple and professional.
              </p>
              </div>
             </div>
             </div>
             <div>
  <div className="flex flex-col">
    
    <h4 className="text-lg font-semibold mb-6">Created by</h4>
    <ul className="space-y-4 text-gray-400">
      <li className="flex items-center space-x-3">
        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="..." />
        </svg>
        <a href="https://instagram.com/creator1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
          Alice – @creator1
        </a>
      </li>
      <li className="flex items-center space-x-3">
        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="..." />
        </svg>
        <a href="https://instagram.com/creator2" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
          Bob – @creator2
        </a>
      </li>
      <li className="flex items-center space-x-3">
        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="..." />
        </svg>
        <a href="https://instagram.com/creator3" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
          Charlie – @creator3
        </a>
      </li>
      <li className="flex items-center space-x-3">
        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="..." />
        </svg>
        <a href="https://instagram.com/creator4" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
          Diana – @creator4
        </a>
      </li>
    </ul>
  </div>








          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 BRAZUCA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default LandingPage;