import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import Recommendation from './pages/Recommendation';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
    // atau return <div>Loading...</div>;
  }

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/wardrobe" element={<PrivateRoute><Wardrobe /></PrivateRoute>} />
      <Route path="/recommendation" element={<PrivateRoute><Recommendation /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  );
}