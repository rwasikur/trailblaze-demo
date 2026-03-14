import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

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
            <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {isAdmin && (
                    <NavLink 
                        to="/admin/dashboard" 
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--accent)' : 'var(--text-main)',
                            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'var(--transition)'
                        })}
                    >
                        Dashboard
                    </NavLink>
                )}
                <NavLink 
                    to="/browse"
                    style={({ isActive }) => ({
                        color: isActive ? 'var(--accent)' : 'var(--text-main)',
                        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        paddingBottom: '4px',
                        transition: 'var(--transition)'
                    })}
                >
                    Catalogue
                </NavLink>
                {!isAdmin && (
                    <NavLink 
                        to="/admin"
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--accent)' : 'var(--text-main)',
                            borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'var(--transition)'
                        })}
                    >
                        Admin Login
                    </NavLink>
                )}
                {isAdmin && (
                    <Link 
                        to="/admin" 
                        onClick={() => {
                            localStorage.removeItem('adminToken');
                            window.dispatchEvent(new Event('authChange'));
                        }}
                        style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }}
                    >
                        Sign Out
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
