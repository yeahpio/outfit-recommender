import { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const STYLE = ['casual', 'formal', 'sporty'];
const WARNA = ['neutral', 'warm', 'cool'];
const SOURCE = ['default', 'personal', 'both'];

export default function Recommendation() {
  const [form, setForm] = useState({ source: 'both', style: '', warna_grup: '' });
  const [outfits, setOutfits] = useState([]);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setOutfits([]);
    try {
      const payload = { source: form.source };
      if (form.style) payload.style = form.style;
      if (form.warna_grup) payload.warna_grup = form.warna_grup;
      const res = await api.post('/recommendation/generate', payload);
      setOutfits(res.data.outfits);
      setTotal(res.data.total_outfit);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-main">
        <h2>Rekomendasi Outfit</h2>
        <form onSubmit={handleGenerate}>
          <select name="source" value={form.source} onChange={handleChange}>
            {SOURCE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="style" value={form.style} onChange={handleChange}>
            <option value="">Semua style</option>
            {STYLE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="warna_grup" value={form.warna_grup} onChange={handleChange}>
            <option value="">Semua warna</option>
            {WARNA.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Generate</button>
        </form>

        {total !== null && <p>Total outfit: {total}</p>}
        <ul>
          {outfits.map((o, i) => (
            <li key={i}>
              <strong>Outfit {i + 1}:</strong> {o.atasan} + {o.bawahan} + {o.sepatu}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}