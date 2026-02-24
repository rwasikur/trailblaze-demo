import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CarDetailsPage from './pages/CarDetailsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/car/:id" element={<CarDetailsPage />} />
                        <Route path="/admin" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
