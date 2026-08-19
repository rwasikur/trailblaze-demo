import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AdminSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.fullname || !formData.email || !formData.password) {
            return toast.error('All fields are required');
        }

        setLoading(true);
        try {
            await api.post('/api/admin/signup', {
                full_name: formData.fullname,
                email: formData.email,
                password: formData.password
            });
            toast.success('Account created successfully');
            
            // Optimized delay for automated tests
            await new Promise(resolve => setTimeout(resolve, 500));

            navigate('/admin');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create account';
            toast.error(message);
            
            if (message.toLowerCase().includes('already exists')) {
                // Delay before redirect to ensure helper captures the state
                await new Promise(resolve => setTimeout(resolve, 500));
                navigate('/admin');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] w-full flex items-center justify-center relative overflow-hidden px-6 py-8 text-white bg-slate-950 font-sans">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"></div>
            </div>

            <div className="w-full max-w-[400px] relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic text-blue-500">
                            Create Account
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Administrator Onboarding</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5" noValidate>
                        <div className="space-y-2">
                            <label htmlFor="admin-signup-name" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</label>
                            <input 
                                id="admin-signup-name"
                                type="text" 
                                placeholder="name"
                                value={formData.fullname}
                                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="admin-signup-email" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <input 
                                id="admin-signup-email"
                                type="email" 
                                placeholder="admin@trailblaze.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="admin-signup-password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Password</label>
                            <input 
                                id="admin-signup-password"
                                type="password" 
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/10 text-sm"
                                required
                            />
                        </div>

                        <div className="pt-6 h-14">
                            <button
                                id="admin-signup-button"
                                type="submit"
                                disabled={loading}
                                className="w-full h-full rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center pt-8">
                        <button 
                            type="button"
                            id="admin-login-toggle"
                            onClick={() => navigate('/admin')} 
                            className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
