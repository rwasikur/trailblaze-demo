import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));

    useEffect(() => {
        const checkAuth = () => setIsAdmin(!!localStorage.getItem('adminToken'));
        // Check auth on route change
        checkAuth();

        window.addEventListener('authChange', checkAuth);
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('authChange', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, [location.pathname]);

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[rgba(13,13,13,0.8)] backdrop-blur-md border-b border-[rgba(74,101,114,0.2)]">
            <Link to="/" className="flex items-center text-accent text-xl font-extrabold no-underline tracking-tight" aria-label="Trailblaze Auto Logo">
                <img src="/carlogo.png" alt="Trailblaze Auto Logo" className="h-[55px] w-auto" />
            </Link>
            <div className="flex items-center space-x-6">
                {isAdmin && <Link to="/admin/dashboard" className="text-slate-200 hover:text-accent font-medium text-sm transition-colors duration-300">Admin Dashboard</Link>}
                {isAdmin && <Link to="/admin/profile" className="text-slate-200 hover:text-accent font-medium text-sm transition-colors duration-300">Profile</Link>}
                <Link id="browse-link" to="/browse" className="text-slate-200 hover:text-accent font-medium text-sm transition-colors duration-300">Catalogue</Link>
                {!isAdmin && <Link id="admin-link" to="/admin" className="text-slate-200 hover:text-accent font-medium text-sm transition-colors duration-300">Admin Login</Link>}
                {isAdmin && <Link to="/admin" className="text-slate-200 hover:text-accent font-medium text-sm transition-colors duration-300" onClick={() => {
                    localStorage.removeItem('adminToken');
                    window.dispatchEvent(new Event('authChange'));
                }}>Sign Out</Link>}
            </div>
        </nav>
    );
};

export default Navbar;
