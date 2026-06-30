import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const userInitial = user?.nama ? user.nama.charAt(0).toUpperCase() : 'U';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <nav className="navbar">
            <div className="nav-brand">Capsule</div>

            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                    Home
                </NavLink>
                <NavLink to="/wardrobe" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Wardrobe
                </NavLink>
                <NavLink to="/recommendation" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Recommendation
                </NavLink>
            </div>

            <div className="nav-user" ref={dropdownRef}>
                <div
                    className={`nav-avatar${dropdownOpen ? ' nav-avatar--active' : ''}`}
                    onClick={() => setDropdownOpen(prev => !prev)}
                    title="Akun saya"
                >
                    {userInitial}
                </div>
                {dropdownOpen && (
                    <div className="nav-dropdown">
                        <button
                            className="nav-dropdown-item"
                            onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                        >
                            <span className="nav-dropdown-icon">👤</span>
                            Profil
                        </button>
                        <div className="nav-dropdown-divider" />
                        <button
                            className="nav-dropdown-item nav-dropdown-item--danger"
                            onClick={handleLogout}
                        >
                            <span className="nav-dropdown-icon">→</span>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;