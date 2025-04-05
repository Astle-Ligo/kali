import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import CreateTournament from "./pages/CreateTournament";
import TournamentDetails from "./pages/TournamentDetails";
import JoinTournament from "./pages/JoinTournament";
import RegisterTeam from "./pages/RegisterTeam";
import ProtectedRoute from "./components/ProtectedRoute"
import CreatedTournamentDetails from "./pages/createdTournamentDetails";
import JoinedTournamentDetails from "./pages/JoinedTournamentDetails";
import EditTournament from "./pages/EditTournament";
import EditTeam from './pages/EditTeam';
import TeamDetails from "./pages/TeamDetails";
import AddPlayer from "./pages/AddPlayer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage isLogin={true} />} />
        <Route path="/signup" element={<AuthPage isLogin={false} />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-tournament" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="/register/:id" element={<ProtectedRoute><RegisterTeam /></ProtectedRoute>} />
        <Route path="/join-tournament" element={<JoinTournament />} />
        <Route path="/tournament/created/:id" element={<CreatedTournamentDetails />} />
        <Route path="/joined-tournament/:tournamentId" element={<JoinedTournamentDetails />} />
        <Route path="/edit-tournament/:id" element={<EditTournament />} />
        <Route path="/tournament/:tournamentId/edit-team/:teamId" element={<EditTeam />} />
        <Route path="/tournament/:tournamentId/team/:teamId" element={<TeamDetails />} />
        <Route path="/tournament/:tournamentId/team/:teamId/add-players" element={<AddPlayer />} />
        <Route path="/edit-team/:teamId" element={<EditTeam />} />
      </Routes>
    </Router>
  );
}

export default App;
