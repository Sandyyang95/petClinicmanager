import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import PetProfile from "./pages/PetProfile";
import Appointment from "./pages/Appointment";
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
         <Route path="/appointments" element={<Appointment />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/pet-profile" element={<RequireAuth><PetProfile /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
