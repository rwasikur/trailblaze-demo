import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const AdminLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        try {
            if (!isLogin && formData.password.length < 6) {
                setLoading(false);
                return toast.error('Password must be at least 6 characters');
            }

            const endpoint = isLogin ? '/api/admin/login' : '/api/admin/signup';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { full_name: formData.full_name, email: formData.email, password: formData.password };

            const { data } = await api.post(endpoint, payload);
            localStorage.setItem('adminToken', data.token);
            window.dispatchEvent(new Event('authChange'));
            toast.success(isLogin ? "Access Granted." : "Account Created.");
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden px-6 text-white font-outfit bg-slate-950">
            {/* Highly Blurred & High-Transparency Blue Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
                    alt="Background Fleet"
                    className="h-full w-full object-cover opacity-60 scale-110 animate-[pulse_20s_infinite_ease-in-out] blur-[8px]"
                />
                {/* Deep Blue/Glass Overlay */}
                <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[4px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_50%)]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* High-Fidelity Glass Card */}
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-10 md:p-14 shadow-2xl transition-all">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-blue-500">
                            {isLogin ? 'Admin Portal' : 'Admin Register'}
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
                            {isLogin ? 'Sign in to manage your fleet' : 'Create an account to manage your fleet'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Email Address</label>
                            <input
                                id="admin-email-input"
                                type="email"
                                placeholder="name@trailblaze.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Password</label>
                            <input
                                id="admin-password-input"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                id="admin-login-button"
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center border-none"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    isLogin ? 'Login' : 'Sign Up'
                                )}
                            </Button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
