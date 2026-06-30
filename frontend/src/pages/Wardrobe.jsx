import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const KATEGORI = ['atasan', 'bawahan', 'sepatu'];
const STYLE = ['casual', 'formal', 'sporty'];
const WARNA = ['neutral', 'warm', 'cool'];

const emptyForm = { nama_pakaian: '', kategori: '', style: '', warna_grup: '', image_path: '' };

export default function Wardrobe() {
  const [defaultItems, setDefaultItems] = useState([]);
  const [personalItems, setPersonalItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDefault();
    fetchPersonal();
  }, []);

  async function fetchDefault() {
    const res = await api.get('/wardrobe/default');
    setDefaultItems(res.data.data);
  }

  async function fetchPersonal() {
    const res = await api.get('/wardrobe/personal');
    setPersonalItems(res.data.data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await api.put(`/wardrobe/personal/${editId}`, form);
        setSuccess('Data berhasil diperbarui');
      } else {
        await api.post('/wardrobe/personal', form);
        setSuccess('Data berhasil ditambahkan');
      }
      setForm(emptyForm);
      setEditId(null);
      fetchPersonal();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  }

  function handleEdit(item) {
    setForm({
      nama_pakaian: item.nama_pakaian,
      kategori: item.kategori,
      style: item.style,
      warna_grup: item.warna_grup,
      image_path: item.image_path || '',
    });
    setEditId(item.id_personal);
  }

  async function handleDelete(id) {
    if (!confirm('Hapus item ini?')) return;
    await api.delete(`/wardrobe/personal/${id}`);
    fetchPersonal();
  }

  return (
    <>
      <Navbar />
      <div className="page-main">
        <h2>Wardrobe</h2>

        <h3>Default Wardrobe</h3>
        <table border="1">
          <thead>
            <tr><th>Nama</th><th>Kategori</th><th>Style</th><th>Warna</th></tr>
          </thead>
          <tbody>
            {defaultItems.map(item => (
              <tr key={item.id_default}>
                <td>{item.nama_pakaian}</td>
                <td>{item.kategori}</td>
                <td>{item.style}</td>
                <td>{item.warna_grup}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Personal Wardrobe</h3>
        <form onSubmit={handleSubmit}>
          <input name="nama_pakaian" placeholder="Nama pakaian" value={form.nama_pakaian} onChange={handleChange} />
          <select name="kategori" value={form.kategori} onChange={handleChange}>
            <option value="">Pilih kategori</option>
            {KATEGORI.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select name="style" value={form.style} onChange={handleChange}>
            <option value="">Pilih style</option>
            {STYLE.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="warna_grup" value={form.warna_grup} onChange={handleChange}>
            <option value="">Pilih warna grup</option>
            {WARNA.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <input name="image_path" placeholder="Image path (opsional)" value={form.image_path} onChange={handleChange} />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <button type="submit">{editId ? 'Update' : 'Tambah'}</button>
          {editId && <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }}>Batal</button>}
        </form>

        <table border="1">
          <thead>
            <tr><th>Nama</th><th>Kategori</th><th>Style</th><th>Warna</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {personalItems.map(item => (
              <tr key={item.id_personal}>
                <td>{item.nama_pakaian}</td>
                <td>{item.kategori}</td>
                <td>{item.style}</td>
                <td>{item.warna_grup}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id_personal)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}