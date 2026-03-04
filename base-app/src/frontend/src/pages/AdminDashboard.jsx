import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeBookings: 0,
        activeRentals: 0,
        fleetStatus: "0 / 0 Ready",
        totalRevenue: 0
    });
    const [cars, setCars] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else fetchStats(token);
    }, [navigate]);

    const fetchStats = async (token) => {
        try {
            const { data } = await api.get('/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data || { activeBookings: 0, activeRentals: 0, fleetStatus: "0 / 0 Ready", totalRevenue: 0 });

            const carsRes = await api.get('/api/admin/cars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch stats/cars:', err);
            setCars([]);
        }
    };

    const deleteCarHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                const token = localStorage.getItem('adminToken');
                await api.delete(`/api/admin/cars/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchStats(token); // Refresh stats and list
                toast.success('Vehicle deleted successfully.');
            } catch (err) {
                console.error('Failed to delete car:', err);
                toast.error('Error deleting vehicle.');
            }
        }
    };

    const updateStatusHandler = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/admin/cars/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStats(token);
            toast.success('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Error updating car status.');
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: '#f8fafc',
            padding: '2rem 5%',
            margin: '-2rem -6%', /* Overrides main-content padding to stretch full screen */
            fontFamily: 'Inter, sans-serif',
            color: '#334155',
            overflowX: 'hidden'
        }}>
            {/* SaaS Top Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Dealership Dashboard</h1>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Welcome back. Here is your fleet overview for today.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/admin/inventory')} className="btn btn-slate" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📋</span> Manage Inventory
                        </button>
                        <button onClick={() => navigate('/admin/add-car')} className="btn btn-slate" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Add New Vehicle
                        </button>
                    </div>
                </div>
            </div>

            {/* SaaS Stat Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
                        💰
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</p>
                        <h3 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
                        📅
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking Requests</p>
                        <h3 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>{stats.activeBookings || 0}</h3>
                    </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', color: '#334155', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
                        🛡️
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fleet Status</p>
                        <h3 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>{stats.fleetStatus}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
