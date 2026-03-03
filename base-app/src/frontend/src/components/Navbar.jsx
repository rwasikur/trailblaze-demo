import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }} aria-label="Trailblaze Auto Logo">
                <img src="/carlogo.png" alt="Trailblaze Auto Logo" style={{ height: '55px', width: 'auto' }} />
            </Link>
            <div className="nav-links">
                <Link to="/browse">Catalogue</Link>
                <Link to="/admin">Admin Login</Link>
            </div>
        </nav>
    );
};

export default Navbar;
