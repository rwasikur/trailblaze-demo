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
        const token = localStorage.getItem('adminToken');
        try {
            await api.delete(`/api/cars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCars(token);
            toast.success('Vehicle deleted successfully.');
        } catch (err) {
            console.error('Failed to delete car:', err);
            toast.error('Error deleting vehicle.');
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 66px)', backgroundColor: '#f8fafc', padding: '2rem 5%', margin: '-2rem -6%', fontFamily: 'Inter, sans-serif', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 700 }}>Admin Dashboard</h1>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage your vehicle inventory.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin/inventory')} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                        Manage Inventory
                    </button>
                    <button onClick={() => navigate('/admin/add-car')} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 600, border: 'none', background: '#4A6572', color: '#fff', cursor: 'pointer' }}>
                        + Add New Vehicle
                    </button>
                </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>All Vehicles</h2>
                {cars.length === 0 ? (
                    <p style={{ color: '#64748b' }}>No vehicles in inventory.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Vehicle</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Year</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map(car => (
                                <tr key={car._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{car.brand} {car.name}</td>
                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{car.model_year}</td>
                                    <td style={{ padding: '0.75rem', color: '#475569' }}>${car.price_per_day?.toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: car.availability_status === 'Available' ? '#f0fdf4' : '#fef2f2', color: car.availability_status === 'Available' ? '#16a34a' : '#dc2626' }}>
                                            {car.availability_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => navigate(`/admin/edit-car/${car._id}`)} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Edit</button>
                                        <button onClick={() => deleteCarHandler(car._id)} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Delete</button>
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
