import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { DollarSign, CalendarCheck, Shield, ClipboardList, Plus } from 'lucide-react';

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

    const statCards = [
        {
            icon: <DollarSign size={22} />,
            label: 'Total Revenue',
            value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
            color: '#22c55e',
            bg: 'rgba(34,197,94,0.08)',
            border: 'rgba(34,197,94,0.2)'
        },
        {
            icon: <CalendarCheck size={22} />,
            label: 'Booking Requests',
            value: stats.activeBookings || 0,
            color: 'var(--accent-light)',
            bg: 'rgba(58,123,213,0.08)',
            border: 'rgba(58,123,213,0.2)'
        },
        {
            icon: <Shield size={22} />,
            label: 'Fleet Status',
            value: stats.fleetStatus,
            color: 'var(--text-muted)',
            bg: 'rgba(255,255,255,0.04)',
            border: 'var(--glass-border)'
        },
    ];

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: 'var(--bg-color)',
            padding: '2rem 5%',
            margin: '-2rem -6%',
            color: 'var(--text-main)',
            overflowX: 'hidden'
        }}>
            {/* ── TOP HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif" }}>
                        Dealership Dashboard
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Welcome back. Here is your fleet overview for today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/admin/inventory')}
                        className="btn btn-slate"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <ClipboardList size={16} /> Manage Inventory
                    </button>
                    <button
                        onClick={() => navigate('/admin/add-car')}
                        className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Plus size={16} /> Add New Vehicle
                    </button>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.1rem',
                        transition: 'all 0.3s'
                    }}>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '12px',
                            background: card.bg,
                            border: `1px solid ${card.border}`,
                            color: card.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {card.label}
                            </p>
                            <h3 style={{ margin: '0.2rem 0 0', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── QUICK LINKS ── */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: '14px',
                padding: '1.5rem 2rem'
            }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Quick Actions
                </h3>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Manage your dealership inventory and vehicle listings.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/admin/inventory')} className="btn btn-slate"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <ClipboardList size={15} /> View All Inventory
                    </button>
                    <button onClick={() => navigate('/admin/add-car')} className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <Plus size={15} /> Add New Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;