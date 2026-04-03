import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

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

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
    );

    return (
        <div className="min-h-full bg-slate-50 py-10 px-6 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 mt-2 text-base">Update your profile and security credentials.</p>
                    </div>
                </div>

                <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-6 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />

                                    <Input
                                        label="Avatar URL"
                                        type="text"
                                        value={formData.avatar_url}
                                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    />

                                    <div className="md:col-span-2 pt-4">
                                        <div className="h-px w-full bg-slate-200 mb-6 rounded-full"></div>
                                        <div className="space-y-2 max-w-md">
                                            <label className="block text-sm font-bold text-red-600">Update Password</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="Leave blank to keep current password"
                                                minLength="6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 px-6 py-5 border-t border-slate-200 flex justify-end gap-4 shrink-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/admin/dashboard')}
                                    className="h-11 px-6 font-bold border-slate-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="slate"
                                    className="h-11 px-8 font-bold shadow-sm"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminProfile;
