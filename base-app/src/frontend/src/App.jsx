import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowseCarsPage from './pages/BrowseCarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const Footer = () => (
    <footer style={{ background: 'var(--primary)', padding: '2rem 5%', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} TrailblazeAuto. All rights reserved.</p>
        <p style={{ color: 'var(--text-muted)' }}>Contact: info@trailblazeauto.com | +1 (555) 123-4567</p>
    </footer>
);

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/browse" element={<BrowseCarsPage />} />
                        <Route path="/car/:id" element={<CarDetailsPage />} />
                        <Route path="/admin" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
