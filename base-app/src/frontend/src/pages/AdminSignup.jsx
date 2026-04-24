import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
        e.preventDefault();

        setLoading(true);
        try {
            await api.post('/api/admin/signup', {
                full_name: formData.fullname,
                email: formData.email,
                password: formData.password
            });
            toast.success('Account created successfully');
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 bg-slate-900 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter">CREATE <span className="text-blue-500">ADMIN</span></h2>
                    <p className="mt-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Secure administrative registration</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="space-y-4">
                        <Input
                            id="admin-signup-name"
                            label="Full Legal Name"
                            type="text"
                            required
                            value={formData.fullname}
                            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                        />
                        <Input
                            id="admin-signup-email"
                            label="Corporate Email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            id="admin-signup-password"
                            label="Access Password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <Button
                        id="admin-signup-button"
                        type="submit"
                        loading={loading}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                        Initialize Account
                    </Button>
                </form>

                <div className="text-center pt-4">
                    <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Return to Security Portal</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
