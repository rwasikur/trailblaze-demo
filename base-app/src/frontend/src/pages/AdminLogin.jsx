import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.email || !formData.password) {
            return toast.error('Email and Password are required.');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/api/admin/login', formData);

            // 1. Set token immediately so re-renders know we are logged in
            localStorage.setItem('adminToken', data.token);
            window.dispatchEvent(new Event('authChange'));

            // 2. Trigger toast
            toast.success("Access Granted.");

            // 3. Optimized delay for automated tests (Playwright)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 4. Navigate
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden px-6 text-white bg-slate-950 font-sans">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic text-blue-500">
                            Admin Login
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Secure Access Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address <span className="text-red-500">*</span></label>
                            <input
                                id="admin-email-input"
                                type="email"
                                placeholder="admin@trailblaze.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Password <span className="text-red-500">*</span></label>
                            <input
                                id="admin-password-input"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="pt-4 h-14">
                            <button
                                id="admin-login-button"
                                type="submit"
                                disabled={loading}
                                className="w-full h-full rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                id="admin-signup-toggle"
                                onClick={() => navigate('/admin/signup')}
                                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                Don't have an account? Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
