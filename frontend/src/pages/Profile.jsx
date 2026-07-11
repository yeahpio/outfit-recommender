import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/pages.css';

// --- small inline icons (no extra dependency needed) -----------------------

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.6 21.6 0 015.06-6.06M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 8 11 8a21.6 21.6 0 01-2.68 3.9M14.12 14.12a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// --- Toast -------------------------------------------------------------

function Toast({ message, show, type }) {
  if (!message) return null;

  const isError = type === 'error';
  return (
    <div className={`toast ${show ? "toast--show" : ""} ${isError ? "toast--error" : ""}`}>
      <div className="toast-icon">{isError ? "✕" : "✓"}</div>
      <div className="toast-message">{message}</div>
    </div>
  );
}

// --- Confirm modal -------------------------------------------------------

function ConfirmModal({ open, title, description, confirmLabel, danger, loading, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-desc">{description}</div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main page -------------------------------------------------------------

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ nama: user?.nama || '', username: user?.username || '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });

  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [toastType, setToastType] = useState('success');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [confirmDeleteAvatarOpen, setConfirmDeleteAvatarOpen] = useState(false);

  const toastTimer = useRef(null);
  const userInitial = user?.nama ? user.nama.charAt(0).toUpperCase() : 'U';

  const BASE_URL = api.defaults.baseURL.replace("/api", "");

  function showToast(message, type = 'success') {
    setToastMsg(message);
    setToastType(type);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2000);
  }

  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
    };
  }, []);

  // --- Avatar ---------------------------------------------------------

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);

    try {
      const res = await api.put('/auth/me/avatar', formData);

      // update AuthContext
      login(res.data.user, localStorage.getItem('token'));

      // tampilkan foto baru
      setAvatarPreview(res.data.user.profile_image);

      showToast('Profile photo updated');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to upload profile photo',
        'error'
      );
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteAvatar() {
    setConfirmDeleteAvatarOpen(false);

    try {
      const res = await api.delete("/auth/me/avatar");

      login(res.data.user, localStorage.getItem("token"));

      setAvatarPreview(null);

      showToast("Profile photo removed");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to remove profile photo",
        'error'
      );
    }
  }

  // --- Account information ---------------------------------------------

  function handleProfileChange(e) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/me', profileForm);
      login(res.data.user, localStorage.getItem('token'));
      showToast('Account information updated');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update account information.');
    } finally {
      setProfileLoading(false);
    }
  }

  // --- Security ----------------------------------------------------------

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.password) {
      setPasswordError('Enter a new password.');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError('Password confirmation does not match.');
      return;
    }
  }

  // --- Account actions -----------------------------------------------------

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete('/auth/me');
      logout();
      navigate('/login');
    } catch (err) {
      showToast('Failed to delete account.', 'error');
      setConfirmDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleLogout() {
    setConfirmLogoutOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <>
      <Navbar />
      <Toast message={toastMsg} show={toastShow} type={toastType} />

      <div className="page-main--narrow">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-sub">Manage your account information and security.</p>
          </div>
        </div>

        {/* Profile Info Header Card */}
        <div className="profile-header-card">
          <div className="avatar-upload">
            <div className={`avatar-lg ${avatarPreview || user?.profile_image ? 'avatar-lg--image' : ''}`}>
              {avatarPreview || user?.profile_image ? (
                <img
                  src={
                    avatarPreview?.startsWith("blob:")
                      ? avatarPreview
                      : `${BASE_URL}${avatarPreview || user?.profile_image}`
                  }
                  alt="Profile"
                />
              ) : (
                userInitial
              )}
            </div>
            <button
              type="button"
              className="avatar-edit-btn"
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              disabled={avatarUploading}
              aria-label="Profile photo options"
              aria-haspopup="menu"
              aria-expanded={avatarMenuOpen}
            >
              <CameraIcon />
            </button>

            {avatarMenuOpen && (
              <div className="avatar-menu">
                <button
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    handleAvatarClick();
                  }}
                >
                  Upload Photo
                </button>

                {(user?.profile_image || avatarPreview) && (
                  <button
                    className="danger"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      setConfirmDeleteAvatarOpen(true);
                    }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
          </div>

          <div>
            <div className="profile-name">{user?.nama || 'User'}</div>
            <div className="profile-uname">@{user?.username || 'username'}</div>
          </div>

          <button onClick={() => setConfirmLogoutOpen(true)} className="btn-secondary" style={{ marginLeft: 'auto' }}>
            Logout
          </button>
        </div>

        {/* Account Information Card */}
        <div className="section-card">
          <div className="section-card-title">Account Information</div>
          <p className="section-card-desc">The full name and username used on your account.</p>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="nama"
                  className="form-input"
                  value={profileForm.nama}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  className="form-input"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  placeholder="Your username"
                  required
                />
              </div>
            </div>

            {profileError && <p className="form-error">⚠ {profileError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="section-card">
          <div className="section-card-title">Security</div>
          <p className="section-card-desc">Update your password regularly to keep your account secure.</p>

          <form onSubmit={handleUpdatePassword}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter the new password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && <p className="form-error">⚠ {passwordError}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Deletion Card */}
        <div className="section-card">
          <div className="section-card-title">Delete Account</div>
          <p className="section-card-desc">
            Deleting your account is permanent. All your clothing data and recommendation history will be removed and cannot be recovered.
          </p>
          <div className="form-actions">
            <button onClick={() => setConfirmDeleteOpen(true)} className="btn-outline-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Log out of your account?"
        description="You'll need to log in again to access your wardrobe and recommendations."
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Permanently delete your account?"
        description="This action cannot be undone. All your clothing data and recommendation history will be lost forever."
        confirmLabel="Yes, Delete Account"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      <ConfirmModal
        open={confirmDeleteAvatarOpen}
        title="Remove profile photo?"
        description="Your profile picture will be removed and replaced with your initial."
        confirmLabel="Remove"
        danger
        onConfirm={handleDeleteAvatar}
        onCancel={() => setConfirmDeleteAvatarOpen(false)}
      />
    </>
  );
}