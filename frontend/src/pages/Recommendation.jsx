import { useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/pages.css';

const STYLE = ['casual', 'formal', 'sporty'];
const WARNA = ['neutral', 'warm', 'cool'];
const SOURCE = ['default', 'personal', 'both'];

const SOURCE_LABELS = {
  default: 'Koleksi Bawaan (Default)',
  personal: 'Koleksi Saya (Personal)',
  both: 'Gabungan (Default & Personal)'
};

export default function Recommendation() {
  const [form, setForm] = useState({ source: 'both', style: '', warna_grup: '' });
  const [outfits, setOutfits] = useState([]);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setOutfits([]);
    setTotal(null);
    setLoading(true);
    try {
      const payload = { source: form.source };
      if (form.style) payload.style = form.style;
      if (form.warna_grup) payload.warna_grup = form.warna_grup;
      const res = await api.post('/recommendation/generate', payload);
      console.log(res.data);
      console.log(res.data.outfits[0]);
      setOutfits(res.data.outfits);
      setTotal(res.data.total_outfit);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghasilkan kombinasi outfit.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-main">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Rekomendasi Outfit</h1>
            <p className="page-sub">Temukan kombinasi setel pakaian terbaik berdasarkan warna dan gayamu.</p>
          </div>
        </div>

        {/* Filter Card */}
        <div className="filter-card">
          <div className="filter-title">Parameter Rekomendasi</div>
          <form onSubmit={handleGenerate}>
            <div className="filter-row">
              <div className="form-group">
                <label className="form-label">Sumber Pakaian</label>
                <select name="source" className="form-select" value={form.source} onChange={handleChange}>
                  {SOURCE.map(s => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gaya Pakaian (Style)</label>
                <select name="style" className="form-select" value={form.style} onChange={handleChange}>
                  <option value="">Semua Style (Gaya)</option>
                  {STYLE.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Grup Warna</label>
                <select name="warna_grup" className="form-select" value={form.warna_grup} onChange={handleChange}>
                  <option value="">Semua Warna</option>
                  {WARNA.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-generate" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Outfit'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card" style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <span style={{ fontWeight: '600', marginRight: '6px' }}>⚠</span>
            {error}
          </div>
        )}

        {/* Results Info */}
        {total !== null && (
          <div className="results-header">
            <span className="results-label">Hasil Rekomendasi</span>
            <span className="results-count">Ditemukan {total} kombinasi outfit</span>
          </div>
        )}

        {/* Outfit Recommendations Grid */}
        <div className="outfit-grid">
          {outfits.map((o, i) => (
            <div className="outfit-card-v2" key={i}>
              <div className="outfit-card-top">
                <span className="outfit-label">Setelan #{i + 1}</span>
                <span className="badge badge-terra" style={{ textTransform: 'uppercase', fontSize: '9px' }}>Matched</span>
              </div>

              <div className="outfit-items-v2">
                {/* Atasan */}
                <div className="outfit-item-v2">
                  <div className="item-img-lg">
                    <img
                      src={o.atasan_image}
                      alt={o.atasan}
                      onClick={() => setSelectedImage(o.atasan_image)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div>
                    <div className="item-name-lg" title={o.atasan}>{o.atasan}</div>
                    <div className="item-meta">Atasan</div>
                  </div>
                </div>

                {/* Connector */}
                <div className="item-connector">
                  <div className="connector-dot" />
                  <div className="connector-line" />
                  <div className="connector-dot" />
                </div>

                {/* Bawahan */}
                <div className="outfit-item-v2">
                  <div className="item-img-lg">
                    <img
                      src={o.bawahan_image}
                      alt={o.bawahan}
                      onClick={() => setSelectedImage(o.bawahan_image)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div>
                    <div className="item-name-lg" title={o.bawahan}>{o.bawahan}</div>
                    <div className="item-meta">Bawahan</div>
                  </div>
                </div>

                {/* Connector */}
                <div className="item-connector">
                  <div className="connector-dot" />
                  <div className="connector-line" />
                  <div className="connector-dot" />
                </div>

                {/* Sepatu */}
                <div className="outfit-item-v2">
                  <div className="item-img-lg">
                    <img
                      src={o.sepatu_image}
                      alt={o.sepatu}
                      onClick={() => setSelectedImage(o.sepatu_image)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div>
                    <div className="item-name-lg" title={o.sepatu}>{o.sepatu}</div>
                    <div className="item-meta">Sepatu</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {total === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', marginBottom: '12px', color: 'var(--text-soft)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p>Tidak menemukan kombinasi outfit yang sesuai dengan kriteria filter.</p>
          </div>
        )}
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
    </>
  );
}