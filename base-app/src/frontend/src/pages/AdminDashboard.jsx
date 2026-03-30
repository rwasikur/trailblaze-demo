import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else fetchCars(token);
    }, [navigate]);

    const fetchCars = async (token) => {
        try {
            const { data } = await api.get('/api/cars/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(data || []);
        } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
        }
    };

    const deleteCarHandler = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/api/cars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCars(token);
        } catch (err) {
            console.error('Failed to delete car:', err);
        }
    };

    const updateStatusHandler = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/cars/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCars(token);
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
            margin: '-2rem -6%',
            fontFamily: 'Inter, sans-serif',
            color: '#334155',
            overflowX: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Dealership Dashboard</h1>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage your fleet inventory.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin/inventory')} className="btn btn-slate" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📋</span> Manage Inventory
                    </button>
                    <button onClick={() => navigate('/admin/add-car')} className="btn btn-slate" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Add New Vehicle
                    </button>
                </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>Fleet Inventory</h2>
                {cars.length === 0 ? (
                    <p style={{ color: '#64748b' }}>No vehicles found. Add a vehicle to get started.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Car</th>
                                <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Brand</th>
                                <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Price/Day</th>
                                <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map((car) => (
                                <tr key={car._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{car.name}</td>
                                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#475569' }}>{car.brand}</td>
                                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#475569' }}>${car.price_per_day}</td>
                                    <td style={{ padding: '0.8rem 1rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                            background: car.availability_status === 'Available' ? '#ecfdf5' : (car.availability_status === 'Pending' ? '#fffbeb' : '#fef2f2'),
                                            color: car.availability_status === 'Available' ? '#059669' : (car.availability_status === 'Pending' ? '#d97706' : '#dc2626'),
                                            border: `1px solid ${car.availability_status === 'Available' ? '#d1fae5' : (car.availability_status === 'Pending' ? '#fef3c7' : '#fee2e2')}`
                                        }}>
                                            {car.availability_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => navigate(`/admin/edit-car/${car._id}`)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                                            <button onClick={() => deleteCarHandler(car._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
