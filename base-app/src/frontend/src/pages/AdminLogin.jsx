import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', confirm_password: '', phone: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('adminToken')) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!isLogin && formData.password.length < 6) {
                return toast.error('Password must be at least 6 characters');
            }

            const endpoint = isLogin ? '/api/admin/login' : '/api/admin/signup';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { full_name: formData.full_name, email: formData.email, password: formData.password };

            const { data } = await api.post(endpoint, payload);
            localStorage.setItem('adminToken', data.token);
            window.dispatchEvent(new Event('authChange'));
            toast.success("Successfully logged in!");
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed.');
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 84px)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            margin: '-2rem -6%',
            overflow: 'auto',
            backgroundColor: '#ffffff'
        }}>

            <style>{`
                .admin-light-panel { color: #000; }
                .admin-light-panel label { color: #2D3748 !important; font-weight: 600; }
                .admin-light-panel input { color: #000 !important; background: rgba(0,0,0,0.05) !important; border-color: #ccc !important; }
                .admin-link { color: var(--accent) !important; transition: all 0.3s ease; }
                .admin-link:hover { opacity: 0.8; }
            `}</style>

            <div className="admin-light-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'rgba(220, 220, 220, 0.45)', backdropFilter: 'blur(12px)', borderRadius: '16px', zIndex: 1, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)' }}>
                <h2 className="page-title" style={{ fontSize: '1.4rem', margin: '0 0 1.5rem 0', padding: 0, color: 'var(--accent)', textShadow: 'none' }}>{isLogin ? 'Admin Portal' : 'Admin Register'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required={!isLogin}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-slate" style={{ width: '100%', marginTop: '1rem', color: '#fff' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                    <div className="admin-link" style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
