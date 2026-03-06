import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowseCarsPage from './pages/BrowseCarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddCarPage from './pages/AddCarPage';
import EditCarPage from './pages/EditCarPage';
import ManageInventoryPage from './pages/ManageInventoryPage';
import AdminProfile from './pages/AdminProfile';
import './index.css';

// Footer removed per request

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <ToastContainer position="bottom-right" theme="dark" />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/browse" element={<BrowseCarsPage />} />
                        <Route path="/car/:id" element={<CarDetailsPage />} />
                        <Route path="/admin" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/inventory" element={<ManageInventoryPage />} />
                        <Route path="/admin/add-car" element={<AddCarPage />} />
                        <Route path="/admin/edit-car/:id" element={<EditCarPage />} />
                        <Route path="/admin/profile" element={<AdminProfile />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
