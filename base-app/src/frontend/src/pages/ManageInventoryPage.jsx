import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronDown, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';

const ManageInventoryPage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, car: null });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else fetchCars(token);
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

    const deleteCarHandler = (car) => {
        setDeleteModal({ isOpen: true, car });
    };

    const confirmDeleteHandler = async () => {
        const id = deleteModal.car?._id;
        if (!id) return;
        
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
        } finally {
            setDeleteModal({ isOpen: false, car: null });
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

    const statusStyle = (status) => {
        if (status === 'Available') return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.25)', dot: '#4ade80' };
        if (status === 'Pending') return { bg: 'rgba(234,179,8,0.1)', color: '#fbbf24', border: 'rgba(234,179,8,0.25)', dot: '#fbbf24' };
        return { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.25)', dot: '#f87171' };
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 84px)',
            backgroundColor: 'var(--bg-color)',
            padding: '1.25rem 3%',
            margin: '0',
            color: 'var(--text-main)'
        }}>
            <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-main)' }}>
                        Manage Inventory
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Overview and management of all registered vehicles.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-slate"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <ArrowLeft size={15} /> Dashboard
                    </button>
                    <button onClick={() => navigate('/admin/add-car')} className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <Plus size={15} /> Add New Vehicle
                    </button>
                </div>
            </div>

            {/* ── TABLE CARD ── */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['ID', 'Vehicle', 'Brand', 'Price', 'Requested By', 'Status', 'Actions'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '0.9rem 1rem',
                                        fontSize: '0.72rem', fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase', letterSpacing: '1px',
                                        textAlign: i === 6 ? 'right' : 'left'
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Loading vehicles...
                                    </td>
                                </tr>
                            ) : cars.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>No vehicles in inventory</p>
                                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>Click "+ Add New Vehicle" to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                cars.map((car, index) => {
                                    const s = statusStyle(car.availability_status);
                                    const isLast = index === cars.length - 1;
                                    return (
                                        <tr
                                            key={car._id}
                                            style={{ borderBottom: isLast ? 'none' : '1px solid var(--glass-border)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* ID */}
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                ...{car._id.substring(car._id.length - 6)}
                                            </td>

                                            {/* Vehicle name */}
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                {car.name}
                                            </td>

                                            {/* Brand */}
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                                {car.brand}
                                            </td>

                                            {/* Price */}
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                                ${Number(car.price_per_day).toLocaleString()}
                                            </td>

                                            {/* Requested by */}
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                {car.requested_by ? (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                        background: 'rgba(58,123,213,0.08)',
                                                        border: '1px solid rgba(58,123,213,0.2)',
                                                        padding: '0.2rem 0.65rem', borderRadius: '100px',
                                                        color: 'var(--accent-light)', fontSize: '0.8rem', fontWeight: 500
                                                    }}>
                                                        👤 {car.requested_by}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>No Requests</span>
                                                )}
                                            </td>

                                            {/* Status badge */}
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                    padding: '0.25rem 0.7rem', borderRadius: '100px',
                                                    fontSize: '0.75rem', fontWeight: 700,
                                                    background: s.bg, color: s.color,
                                                    border: `1px solid ${s.border}`
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                                    {car.availability_status}
                                                </span>
                                            </td>

                                            {/* Actions dropdown */}
                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', position: 'relative' }}>
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === car._id ? null : car._id)}
                                                        style={{
                                                            cursor: 'pointer', padding: '0.4rem 0.85rem',
                                                            fontSize: '0.82rem', fontWeight: 600,
                                                            background: activeDropdown === car._id ? 'rgba(58,123,213,0.12)' : 'var(--surface-raised)',
                                                            color: activeDropdown === car._id ? 'var(--accent-light)' : 'var(--text-muted)',
                                                            border: `1px solid ${activeDropdown === car._id ? 'rgba(58,123,213,0.3)' : 'var(--glass-border)'}`,
                                                            borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px',
                                                            transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif"
                                                        }}
                                                    >
                                                        Options <ChevronDown size={13} />
                                                    </button>

                                                    {activeDropdown === car._id && (
                                                        <>
                                                            <div onClick={() => setActiveDropdown(null)}
                                                                style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                                                            <div style={{
                                                                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                                                zIndex: 10, minWidth: '170px',
                                                                background: '#1c2a38',
                                                                border: '1px solid var(--glass-border)',
                                                                borderRadius: '12px', padding: '0.4rem',
                                                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                                                                color: '#ffffff'
                                                            }}>
                                                                {car.availability_status === 'Pending' && (
                                                                    <>
                                                                        <button onClick={() => { updateStatusHandler(car._id, 'Unavailable'); setActiveDropdown(null); }}
                                                                            className="dropdown-item-dark" style={{ color: '#4ade80' }}>
                                                                            <CheckCircle size={14} /> Approve
                                                                        </button>
                                                                        <button onClick={() => { updateStatusHandler(car._id, 'Available'); setActiveDropdown(null); }}
                                                                            className="dropdown-item-dark" style={{ color: 'var(--text-muted)' }}>
                                                                            <XCircle size={14} /> Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {car.availability_status === 'Unavailable' && (
                                                                    <button onClick={() => { updateStatusHandler(car._id, 'Available'); setActiveDropdown(null); }}
                                                                        className="dropdown-item-dark" style={{ color: 'var(--accent-light)' }}>
                                                                        <RotateCcw size={14} /> Mark Available
                                                                    </button>
                                                                )}
                                                                <button onClick={() => { setActiveDropdown(null); navigate(`/admin/edit-car/${car._id}`); }}
                                                                    className="dropdown-item-dark" style={{ color: '#ffffff' }}>
                                                                    <Pencil size={14} /> Edit Vehicle
                                                                </button>
                                                                <div style={{ margin: '0.25rem 0', borderTop: '1px solid var(--glass-border)' }} />
                                                                <button onClick={() => { deleteCarHandler(car); setActiveDropdown(null); }}
                                                                    className="dropdown-item-dark" style={{ color: '#ff8a8a' }}>
                                                                    <Trash2 size={14} /> Delete Vehicle
                                                                </button>
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

            {/* Dropdown item styles */}
            <style>{`
                .dropdown-item-dark {
                    width: 100%;
                    padding: 0.6rem 0.85rem;
                    font-size: 0.85rem;
                    text-align: left;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    border-radius: 8px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: background 0.15s;
                    font-family: 'DM Sans', sans-serif;
                }
                .dropdown-item-dark:hover {
                    background: rgba(255,255,255,0.1);
                    filter: brightness(1.2);
                }
            `}</style>
            <DeleteModal 
                isOpen={deleteModal.isOpen} 
                carName={deleteModal.car?.name}
                onConfirm={confirmDeleteHandler}
                onCancel={() => setDeleteModal({ isOpen: false, car: null })}
            />
        </div>
    </div>
);
};

export default ManageInventoryPage;