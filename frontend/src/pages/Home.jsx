import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="page-main">
        <h2>Selamat datang, {user?.nama}!</h2>
        <nav>
          <button onClick={() => navigate('/wardrobe')}>Wardrobe</button>
          <button onClick={() => navigate('/recommendation')}>Rekomendasi Outfit</button>
        </nav>
      </div>
    </>
  );
}