import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

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
        <div className="min-h-full flex items-center justify-center -m-8 py-16 px-6 bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/car3.avif')] bg-cover bg-center opacity-10"></div>
            
            <Card className="w-full max-w-md bg-white/70 backdrop-blur-xl border-slate-200 shadow-2xl relative z-10 p-2 md:p-4">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-extrabold text-accent font-display tracking-tight">
                        {isLogin ? 'Admin Portal' : 'Admin Register'}
                    </CardTitle>
                    <p className="text-slate-500 text-sm mt-2">{isLogin ? 'Sign in to manage your fleet.' : 'Create an account to manage your fleet.'}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                label="Full Name"
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required={!isLogin}
                            />
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full mt-6 shadow-md h-12 text-base font-bold" variant="slate">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </Button>
                        <div 
                            className="text-center mt-6 text-sm text-accent hover:text-slate-700 font-semibold cursor-pointer transition-colors" 
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
