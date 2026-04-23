import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));

    useEffect(() => {
        const checkAuth = () => setIsAdmin(!!localStorage.getItem('adminToken'));
        checkAuth();
        window.addEventListener('authChange', checkAuth);
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('authChange', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast.info('Logged out successfully');
        setIsAdmin(false);
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-[1000] h-20 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-4 decoration-0 group">
                    <img
                        src="/carlogo.png"
                        alt="TrailblazeAuto"
                        className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="text-xl font-black tracking-tighter text-white lg:text-2xl">
                        TRAILBLAZE<span className="text-blue-500">AUTO</span>
                    </span>
                </Link>

                <div className="flex items-center space-x-8">
                    <Link id="browse-link" to="/browse" className="text-sm font-bold tracking-wide text-slate-300 hover:text-white transition-colors duration-200"> Catalogue</Link>

                    {isAdmin ? (
                        <>
                            <Link to="/admin/dashboard" className="text-sm font-bold tracking-wide text-slate-300 hover:text-white transition-colors duration-200">Dashboard</Link>
                            <Link to="/admin/profile" className="text-sm font-bold tracking-wide text-slate-300 hover:text-white transition-colors duration-200">Profile</Link>
                            <button
                                onClick={handleLogout}
                                className="rounded-xl bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            id="admin-link"
                            to="/admin"
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95"
                        >
                            Admin Access
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
