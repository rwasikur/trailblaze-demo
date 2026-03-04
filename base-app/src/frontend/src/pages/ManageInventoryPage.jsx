import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const ManageInventoryPage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
        } else {
            fetchCars(token);
        }
    }, [navigate]);

    const fetchCars = async (token) => {
        setLoading(true);
        try {
            const carsRes = await api.get('/api/admin/cars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteCarHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                const token = localStorage.getItem('adminToken');
                await api.delete(`/api/admin/cars/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCars(token);
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
            color: '#334155'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Manage Inventory</h1>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Overview and management of all registered vehicles.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        Back to Dashboard
                    </button>
                    <button onClick={() => navigate('/admin/add-car')} className="btn btn-slate" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4A6572', color: '#ffffff', border: 'none', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Add New Vehicle
                    </button>
                </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                <div style={{ paddingBottom: '120px' }}>
                    <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ width: '8%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '12px' }}>ID</th>
                                <th style={{ width: '22%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Car Name</th>
                                <th style={{ width: '15%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Brand</th>
                                <th style={{ width: '15%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Price/Day</th>
                                <th style={{ width: '15%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Requested By</th>
                                <th style={{ width: '15%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                <th style={{ width: '10%', padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', borderTopRightRadius: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading vehicles...</td>
                                </tr>
                            ) : cars.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                                        <p style={{ margin: 0, fontWeight: 500 }}>No vehicles found in inventory.</p>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Click "+ Add New Vehicle" to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                cars.map((car, index) => {
                                    const isLast = index === cars.length - 1;
                                    return (
                                        <tr key={car._id} style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9', background: '#ffffff', transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>...{car._id.substring(car._id.length - 6)}</td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{car.name}</td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#475569' }}>{car.brand}</td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>₹{car.price_per_day}</td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#64748b', fontStyle: car.requested_by ? 'normal' : 'italic' }}>
                                                {car.requested_by ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#334155' }}>👤 {car.requested_by}</span>
                                                ) : 'No Requests'}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: car.availability_status === 'Available' ? '#ecfdf5' : (car.availability_status === 'Pending' ? '#fffbeb' : '#fef2f2'),
                                                    color: car.availability_status === 'Available' ? '#059669' : (car.availability_status === 'Pending' ? '#d97706' : '#dc2626'),
                                                    border: `1px solid ${car.availability_status === 'Available' ? '#d1fae5' : (car.availability_status === 'Pending' ? '#fef3c7' : '#fee2e2')}`
                                                }}>
                                                    {car.availability_status === 'Available' ? '● Available' : (car.availability_status === 'Pending' ? '○ Pending' : '■ Unavailable')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', position: 'relative', textAlign: 'right' }}>
                                                <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === car._id ? null : car._id)}
                                                        style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: activeDropdown === car._id ? '#f1f5f9' : '#f8fafc', color: activeDropdown === car._id ? '#0f172a' : '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 600, transition: 'all 0.2s ease' }}
                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                                                        onMouseOut={(e) => { if (activeDropdown !== car._id) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; } }}
                                                    >
                                                        Options <span style={{ fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '4px' }}>▼</span>
                                                    </button>
                                                    {activeDropdown === car._id && (
                                                        <>
                                                            <div onClick={() => setActiveDropdown(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9, cursor: 'default' }}></div>
                                                            <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, marginTop: '0.5rem', minWidth: '160px', display: 'flex', flexDirection: 'column', padding: '0.4rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                                                                {car.availability_status === 'Pending' && (
                                                                    <>
                                                                        <button onClick={() => { updateStatusHandler(car._id, 'Unavailable'); setActiveDropdown(null); }} style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', textAlign: 'left', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 500 }} onMouseOver={(e) => e.target.style.background = '#ecfdf5'} onMouseOut={(e) => e.target.style.background = 'transparent'}>✓ Approve</button>
                                                                        <button onClick={() => { updateStatusHandler(car._id, 'Available'); setActiveDropdown(null); }} style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', textAlign: 'left', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 500 }} onMouseOver={(e) => e.target.style.background = '#f1f5f9'} onMouseOut={(e) => e.target.style.background = 'transparent'}>✕ Reject</button>
                                                                    </>
                                                                )}
                                                                {car.availability_status === 'Unavailable' && (
                                                                    <button onClick={() => { updateStatusHandler(car._id, 'Available'); setActiveDropdown(null); }} style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', textAlign: 'left', background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 500 }} onMouseOver={(e) => e.target.style.background = '#f1f5f9'} onMouseOut={(e) => e.target.style.background = 'transparent'}>↩ Return</button>
                                                                )}
                                                                <button onClick={() => { setActiveDropdown(null); navigate(`/admin/edit-car/${car._id}`); }} style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', textAlign: 'left', background: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 500 }} onMouseOver={(e) => e.target.style.background = '#eff6ff'} onMouseOut={(e) => e.target.style.background = 'transparent'}>✎ Edit Vehicle</button>
                                                                <hr style={{ margin: '0.2rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                                                                <button onClick={() => { deleteCarHandler(car._id); setActiveDropdown(null); }} style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', textAlign: 'left', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 500 }} onMouseOver={(e) => e.target.style.background = '#fef2f2'} onMouseOut={(e) => e.target.style.background = 'transparent'}>🗑 Delete Vehicle</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageInventoryPage;
