import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">TrailblazeAuto</Link>
            <div className="nav-links">
                <Link to="/">Catalogue</Link>
                <Link to="/admin">Admin</Link>
            </div>
        </nav>
    );
};

export default Navbar;
