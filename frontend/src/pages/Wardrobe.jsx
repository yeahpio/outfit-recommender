import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/pages.css';

const KATEGORI = ['atasan', 'bawahan', 'sepatu'];
const STYLE = ['casual', 'formal', 'sporty'];
const WARNA = ['neutral', 'warm', 'cool'];

const emptyForm = { nama_pakaian: '', kategori: '', style: '', warna_grup: '', image_path: '' };

const COLOR_MAP = {
  neutral: { hex: '#D1D5DB', name: 'Neutral (Gray/Black/White)' },
  warm: { hex: '#F59E0B', name: 'Warm (Brown/Yellow/Red)' },
  cool: { hex: '#3B82F6', name: 'Cool (Blue/Green/Purple)' }
};

// Base URL for resolving relative image paths from the backend.
const API_BASE_URL = api.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';

// Single source of truth for turning a stored image_path (or image_url)
// into something an <img> tag can actually load, whether it's already
// a full URL or just a relative path returned by the backend.
function resolveImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('//')) return `https:${path}`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

export default function Wardrobe() {
  const [defaultItems, setDefaultItems] = useState([]);
  const [personalItems, setPersonalItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formImageError, setFormImageError] = useState(false);

  // Filtering states
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'default'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);

  // Delete confirmation modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDefault();
    fetchPersonal();
  }, []);

  async function fetchDefault() {
    try {
      const res = await api.get('/wardrobe/default');
      setDefaultItems(res.data.data);
    } catch (err) {
      console.error('Failed to retrieve default wardrobe:', err);
    }
  }

  async function fetchPersonal() {
    try {
      const res = await api.get('/wardrobe/personal');
      setPersonalItems(res.data.data);
    } catch (err) {
      console.error('Failed to retrieve personal wardrobe:', err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFormImageError(false);

    // Create local preview immediately
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/wardrobe/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setForm(prev => ({
        ...prev,
        image_path: res.data.image_path
      }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        await api.put(`/wardrobe/personal/${editId}`, form);
        setSuccess('Clothing updated successfully!');
      } else {
        await api.post('/wardrobe/personal', form);
        setSuccess('Clothing added successfully!');
      }
      setForm(emptyForm);
      setSelectedFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setFormImageError(false);
      setEditId(null);
      fetchPersonal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  }

  function handleEdit(item) {
    setForm({
      nama_pakaian: item.nama_pakaian,
      kategori: item.kategori,
      style: item.style,
      warna_grup: item.warna_grup,
      image_path: item.image_path || item.image_url || '',
    });
    setSelectedFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setFormImageError(false);
    setEditId(item.id_personal);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id) {
    setDeleteTargetId(id);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/wardrobe/personal/${deleteTargetId}`);
      fetchPersonal();
      setDeleteTargetId(null);
    } catch (err) {
      setError('Failed to delete clothing.');
      setDeleteTargetId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Get current active items based on tab
  const itemsToFilter = activeTab === 'personal' ? personalItems : defaultItems;

  // Filter items based on category and search query
  const filteredItems = itemsToFilter.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.kategori === categoryFilter;
    const matchesSearch = item.nama_pakaian.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function renderIcon(kategori) {
    if (kategori === 'atasan') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.62 2V9a2 2 0 0 0 2 2h2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V11h2a2 2 0 0 0 2-2V5.42a2 2 0 0 0-1.62-2z"/>
        </svg>
      );
    } else if (kategori === 'bawahan') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
          <path d="M12 2v20M4 11h16"/>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
          <path d="M3 12h18M3 12a9 9 0 0 1 18 0M3 12c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6"/>
        </svg>
      );
    }
  }

  const formImageSrc = imagePreview || (formImageError ? null : resolveImageUrl(form.image_path));

  return (
    <>
      <Navbar />
      <div className="page-main">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Wardrobe</h1>
            <p className="page-sub">Manage and organize all your capsule wardrobe clothing.</p>
          </div>
        </div>

        {/* Add/Edit Form (only shown if tab is personal, or always shown on top for convenience) */}
        <div className="form-card">
          <div className="form-card-title">
            {editId ? 'Edit Your Clothing' : 'Add New Clothing to Wardrobe'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-with-image">
              <div className="image-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="imageUpload"
                />

                <label
                  htmlFor="imageUpload"
                  style={{
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {formImageSrc ? (
                    <img
                      src={formImageSrc}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                      onError={() => setFormImageError(true)}
                    />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>

                      <div className="image-upload-label">
                        {uploading ? "Uploading..." : "Select Photo"}
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="form-fields-col">
                <div className="form-grid-4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Clothing Name</label>
                    <input
                      name="nama_pakaian"
                      className="form-input"
                      placeholder="Example: Red Flannel Shirt"
                      value={form.nama_pakaian}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="kategori" className="form-select" value={form.kategori} onChange={handleChange} required>
                      <option value="">Select...</option>
                      {KATEGORI.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Style</label>
                    <select name="style" className="form-select" value={form.style} onChange={handleChange} required>
                      <option value="">Select...</option>
                      {STYLE.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color Group</label>
                    <select name="warna_grup" className="form-select" value={form.warna_grup} onChange={handleChange} required>
                      <option value="">Select...</option>
                      {WARNA.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>⚠ {error}</p>}
            {success && <p style={{ color: '#27AE60', fontSize: '13px', marginBottom: '12px' }}>✓ {success}</p>}

            <div className="form-actions">
              {editId && (
                <button type="button" className="btn-secondary" onClick={() => {
                  setForm(emptyForm);
                  setSelectedFile(null);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                  setFormImageError(false);
                  setEditId(null);
                }}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-primary">
                {editId ? 'Update Clothing' : 'Save to Wardrobe'}
              </button>
            </div>
          </form>
        </div>

        {/* Tab Selection & Filter Bar */}
        <div className="filter-bar">
          <button
            className={`filter-chip ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => { setActiveTab('personal'); setCategoryFilter('all'); }}
          >
            My Collection ({personalItems.length})
          </button>
          <button
            className={`filter-chip ${activeTab === 'default' ? 'active' : ''}`}
            onClick={() => { setActiveTab('default'); setCategoryFilter('all'); }}
          >
            Default Collection ({defaultItems.length})
          </button>

          <span style={{ color: 'var(--border)', margin: '0 8px' }}>|</span>

          {/* Category Chips */}
          <button
            className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </button>
          {KATEGORI.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}

          <div className="filter-right">
            <input
              type="text"
              className="search-input"
              placeholder="Search clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clothing Items Grid */}
        <div className="clothing-grid">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', marginBottom: '12px', color: 'var(--text-soft)' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p>No clothing matches your filters or search query.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const id = item.id_personal || item.id_default;
              const colorInfo = COLOR_MAP[item.warna_grup] || { hex: '#ccc', name: item.warna_grup };
              const itemImageSrc = resolveImageUrl(item.image_path || item.image_url);

              return (
                <div className="clothing-card" key={id}>
                  <div className="clothing-img">
                    {itemImageSrc ? (
                      <img
                          src={itemImageSrc}
                          alt={item.nama_pakaian}
                          onClick={() => setSelectedImage(itemImageSrc)}
                          style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              cursor: 'pointer'
                          }}
                          onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                          }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: itemImageSrc ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-soft)'
                      }}
                    >
                      {renderIcon(item.kategori)}
                    </div>
                  </div>

                  <div className="clothing-info">
                    <div className="clothing-name" title={item.nama_pakaian}>
                      {item.nama_pakaian}
                    </div>

                    <div className="clothing-tags">
                      <span className="tag tag-cat">{item.kategori}</span>
                      <span className="tag tag-style">{item.style}</span>
                    </div>

                    <div className="color-dot-row">
                      <div
                        className="color-dot"
                        style={{ background: colorInfo.hex }}
                      />
                      <span className="color-label">{colorInfo.name}</span>
                    </div>

                    {activeTab === 'personal' && (
                      <div className="card-actions">
                        <button className="btn-edit" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id_personal)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {selectedImage && (
          <div
              className="image-preview-overlay"
              onClick={() => setSelectedImage(null)}
          >
              <img
                  src={selectedImage}
                  alt="Preview"
                  className="image-preview"
                  onClick={(e) => e.stopPropagation()}
              />
          </div>
      )}

      <ConfirmModal
        open={!!deleteTargetId}
        title="Remove this item?"
        description="This clothing item will be removed from your wardrobe. This action cannot be undone."
        confirmLabel="Remove"
        danger
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}