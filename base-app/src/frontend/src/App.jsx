import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowseCarsPage from './pages/BrowseCarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddCarPage from './pages/AddCarPage';
import EditCarPage from './pages/EditCarPage';
import ManageCataloguePage from './pages/ManageCataloguePage';
import AdminProfile from './pages/AdminProfile';
import AdminSignup from './pages/AdminSignup';
import CompareResultsPage from './pages/CompareResultsPage';
import { PageTransition } from './components/ui/PageTransition';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/browse" element={<PageTransition><BrowseCarsPage /></PageTransition>} />
        <Route path="/car/:id" element={<PageTransition><CarDetailsPage /></PageTransition>} />
        <Route path="/compare" element={<PageTransition><CompareResultsPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin/signup" element={<PageTransition><AdminSignup /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/catalogue" element={<PageTransition><ManageCataloguePage /></PageTransition>} />
        <Route path="/admin/add-car" element={<PageTransition><AddCarPage /></PageTransition>} />
        <Route path="/admin/edit-car/:id" element={<PageTransition><EditCarPage /></PageTransition>} />
        <Route path="/admin/profile" element={<PageTransition><AdminProfile /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
        <Navbar />
        <ToastContainer position="top-right" theme="dark" />
        <main className="flex-1 w-full flex flex-col overflow-x-clip">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
