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
            toast.success("Successfully logged in!");
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed.');
        }
    };

    return (
        <div style={{
            margin: '-2rem -5.5% -2rem -5.5%',
            minHeight: 'calc(100vh - 84px)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            overflow: 'hidden'
        }}>
            {/* Split Composite Background Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', zIndex: -1 }}>
                <div style={{ flex: 1, backgroundImage: 'url("/group of cars.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/latest admin car.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/car1.webp")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
            </div>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1 }}>
                <h2 className="page-title" style={{ fontSize: '2.5rem', margin: '0 0 1.5rem 0', padding: 0 }}>{isLogin ? 'Admin Portal' : 'Admin Register'}</h2>
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
                        <label>Gmail</label>
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

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: 'var(--accent)' }} onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
