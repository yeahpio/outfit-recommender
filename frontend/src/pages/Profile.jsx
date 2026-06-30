import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: user?.nama || '', username: user?.username || '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/auth/me', form);
      login(res.data.user, localStorage.getItem('token'));
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  }

  async function handleDelete() {
    if (!confirm('Hapus akun? Tindakan ini tidak bisa dibatalkan.')) return;
    await api.delete('/auth/me');
    logout();
    navigate('/login');
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <Navbar />
      <div className="page-main">
        <h2>Profil</h2>
        <form onSubmit={handleUpdate}>
          <div>
            <label>Nama</label>
            <input name="nama" value={form.nama} onChange={handleChange} />
          </div>
          <div>
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} />
          </div>
          <div>
            <label>Password baru (opsional)</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <button type="submit">Simpan</button>
        </form>
        <hr />
        <button onClick={handleLogout} style={{ marginBottom: '8px' }}>Logout</button>
        <br />
        <button onClick={handleDelete} style={{ color: 'red' }}>Hapus Akun</button>
      </div>
    </>
  );
}