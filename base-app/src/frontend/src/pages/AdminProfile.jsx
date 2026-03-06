import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        avatar_url: '',
        password: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchProfile(token);
    }, [navigate]);

    const fetchProfile = async (token) => {
        try {
            const { data } = await api.get('/api/admin/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                avatar_url: data.avatar_url || '',
                password: ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            toast.error('Session expired. Please login again.');
            localStorage.removeItem('adminToken');
            navigate('/admin');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const updateData = { ...formData };
            if (!updateData.password) delete updateData.password;

            const { data } = await api.put('/api/admin/profile', updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Profile updated successfully!');
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading profile...</div>;

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: '#ffffff',
            padding: '2rem 5%',
            margin: '-2rem -5.5%', /* Overrides parent padding to stretch full screen */
            fontFamily: 'Inter, sans-serif',
            color: '#1e293b',
            boxSizing: 'border-box',
            overflowX: 'hidden'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>Account Settings</h1>
                        <p style={{ margin: '0.4rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Update your profile and security credentials.</p>
                    </div>
                </div>

                <div style={{
                    background: '#ffffff',
                    padding: '2.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
                            <div className="form-group">
                                <label style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Avatar URL</label>
                                <input
                                    type="text"
                                    value={formData.avatar_url}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0 1.5rem 0' }} />
                                <label style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Update Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                    placeholder="Leave blank to keep current password"
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <div style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: '#fff',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.6rem 2rem',
                                    background: '#4A6572',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
