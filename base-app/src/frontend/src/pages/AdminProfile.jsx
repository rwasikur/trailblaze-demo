import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const AdminProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        avatar_url: '',
        bio: '',
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
                bio: data.bio || '',
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('avatar', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await api.post('/api/admin/profile/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setFormData(prev => ({ ...prev, avatar_url: data.imageUrl }));
            toast.success('Image uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
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
            // Clear password field after successful update
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 py-20 px-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">Account Settings</h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl">Update your profile and security credentials.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Perspective Card */}
                    <div className="space-y-6">
                        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-10 text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="mx-auto relative h-32 w-32 group/avatar">
                                    <div className="absolute inset-0 rounded-full bg-blue-600 blur-2xl opacity-20 animate-pulse"></div>
                                    <div className="relative h-full w-full rounded-full border-2 border-white/10 p-1 flex items-center justify-center overflow-hidden bg-slate-900 shadow-inner">
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover rounded-full" />
                                        ) : (
                                            <div className="text-4xl font-black text-white uppercase">{formData.full_name?.charAt(0)}</div>
                                        )}

                                        {/* Upload Overlay */}
                                        <button
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={uploading}
                                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 cursor-pointer"
                                        >
                                            {uploading ? (
                                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Update</span>
                                                </>
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">{formData.full_name}</h2>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-slate-400 text-sm italic leading-relaxed">
                                        "{formData.bio || 'The architecture of your bio will appear here after synchronization.'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-white/5 border border-white/5 p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                Meta Statistics
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Account Status</span>
                                    <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Verified Active</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Role Level</span>
                                    <span className="text-white font-black uppercase tracking-widest text-[10px]">Root Access</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modification Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Email Gateway</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Direct Communication</label>
                                    <input
                                        type="text"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Avatar Vector (URL)</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={formData.avatar_url}
                                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Professional Bio</label>
                                    <textarea
                                        rows="4"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                                        placeholder="Briefly describe your role and heritage..."
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-xl font-bold text-white tracking-tight mb-8 italic text-red-500">Security Sector</h3>
                                <div className="max-w-md space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Update Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-red-600/5 border border-red-600/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-600/40 focus:bg-red-600/10 transition-all placeholder:text-white/10"
                                    />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1 mt-2"> Leave blank to keep current password.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-10">
                                <Button
                                    type="submit"
                                    className="h-16 flex-1 rounded-2xl bg-blue-600 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    Synchronize Profile Data
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/admin/dashboard')}
                                    variant="outline"
                                    className="h-16 px-10 rounded-2xl border-white/10 bg-transparent text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
