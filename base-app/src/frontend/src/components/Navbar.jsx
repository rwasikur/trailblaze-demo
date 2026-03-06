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
        <nav className="navbar">
            <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }} aria-label="Trailblaze Auto Logo">
                <img src="/carlogo.png" alt="Trailblaze Auto Logo" style={{ height: '55px', width: 'auto' }} />
            </Link>
            <div className="nav-links">
                {isAdmin && <Link to="/admin/dashboard">Admin Dashboard</Link>}
                <Link to="/browse">Catalogue</Link>
                {!isAdmin && <Link to="/admin">Admin Login</Link>}
                {isAdmin && <Link to="/admin" onClick={() => {
                    localStorage.removeItem('adminToken');
                    window.dispatchEvent(new Event('authChange'));
                }}>Sign Out</Link>}
            </div>
        </nav>
    );
};

export default Navbar;
