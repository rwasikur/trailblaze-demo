import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Car } from 'lucide-react';

const AdminLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
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
        
        if (!isLogin && formData.password !== formData.confirm_password) {
            return toast.error('Passwords do not match');
        }

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
            minHeight: 'calc(100vh - 66px)',
            display: 'flex',
            margin: '-2rem -5.5%',
            background: 'var(--bg-color)',
            overflow: 'hidden'
        }}>
            {/* Left Panel: Branding */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                color: 'white',
                position: 'relative'
            }}>
                <div style={{ zIndex: 2, textAlign: 'center' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Car size={40} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>TrailBlazeAuto</h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '300px' }}>
                        Manage your fleet, bookings, and inventory with our powerful administration tools.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', bottom: '10%', opacity: 0.1, fontSize: '10rem', fontWeight: 900 }}>ADMIN</div>
            </div>

            {/* Right Panel: Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                background: 'var(--bg-color)'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            {isLogin ? 'Welcome Back' : 'Join the Team'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {isLogin ? 'Enter your credentials to access the portal' : 'Create an admin account to get started'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required={!isLogin}
                                        style={{ paddingLeft: '3rem' }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    placeholder="admin@trailblaze.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '1rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirm_password}
                                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                        required={!isLogin}
                                        style={{ 
                                            paddingLeft: '3rem',
                                            borderColor: formData.confirm_password && formData.password !== formData.confirm_password ? '#ef4444' : 'var(--glass-border)'
                                        }}
                                    />
                                    {formData.confirm_password && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '1rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            color: formData.password === formData.confirm_password ? '#10b981' : '#ef4444',
                                            fontSize: '0.8rem'
                                        }}>
                                            {formData.password === formData.confirm_password ? 'Match' : 'No Match'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-slate" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                            {isLogin ? 'Sign In to Dashboard' : 'Create Admin Account'}
                        </button>

                        <div 
                            style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }} 
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Need an admin account? Register" : "Already registered? Sign In"}
                        </div>
                    </form>

                    <div style={{ 
                        marginTop: '4rem', 
                        paddingTop: '2rem', 
                        borderTop: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                    }}>
                        <ShieldCheck size={14} />
                        Secured Admin Access
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
