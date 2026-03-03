import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '', price_per_day: '', description: '', image_url: '', availability_status: 'Available'
    });
    const [stats, setStats] = useState({
        activeBookings: 0,
        activeRentals: 0,
        fleetStatus: "0 / 0 Ready",
        totalRevenue: 0
    });
    const [uploading, setUploading] = useState(false);
    const [cars, setCars] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

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
            setStats(data);

            const carsRes = await api.get('/api/admin/cars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsRes.data);
        } catch (err) {
            console.error('Failed to fetch stats/cars:', err);
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

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploading(true);
        try {
            const { data } = await api.post('/api/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData({ ...formData, image_url: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${data.url}` });
            setUploading(false);
            toast.success("Image uploaded!");
        } catch (error) {
            console.error(error);
            setUploading(false);
            toast.error('Upload failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/admin/add-car', formData, config);
            toast.success('Vehicle added successfully!');
            fetchStats(token);
            setFormData({ name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '', price_per_day: '', description: '', image_url: '', availability_status: 'Available' });
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{
            margin: '-2rem -5.5% -2rem -5.5%',
            minHeight: 'calc(100vh - 66px)',
            position: 'relative',
            padding: '4rem 5%',
            overflow: 'hidden'
        }}>
            {/* Split Composite Background Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', zIndex: -1 }}>
                <div style={{ flex: 1, backgroundImage: 'url("/group of cars.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/latest admin car.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/car1.webp")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(0, 0, 0, 0.75)', padding: '2rem', borderRadius: '16px', zIndex: 1, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>Dealership Admin</h1>
                    <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>Sign Out</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>Total Revenue</h3>
                        <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold' }}>₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>Booking Requests</h3>
                        <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold' }}>{stats.activeBookings}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>Active Rentals</h3>
                        <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold' }}>{stats.activeRentals}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-color)', opacity: 0.8 }}>Fleet Status</h3>
                        <p style={{ fontSize: '2rem', margin: '0.5rem 0 0', fontWeight: 'bold' }}>{stats.fleetStatus}</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0 }}>Manage Inventory</h2>
                        <button onClick={() => setShowAddForm(!showAddForm)} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            {showAddForm ? 'Cancel Application' : '+ Add New Vehicle'}
                        </button>
                    </div>

                    <div style={{ overflow: 'visible', marginBottom: '3rem', paddingBottom: '5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>Car Name</th>
                                    <th style={{ padding: '1rem' }}>Brand</th>
                                    <th style={{ padding: '1rem' }}>Price/Day</th>
                                    <th style={{ padding: '1rem' }}>Requested By</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map(car => (
                                    <tr key={car._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem' }}>...{car._id.substring(car._id.length - 6)}</td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{car.name}</td>
                                        <td style={{ padding: '1rem' }}>{car.brand}</td>
                                        <td style={{ padding: '1rem' }}>₹{car.price_per_day}</td>
                                        <td style={{ padding: '1rem', color: 'var(--accent)' }}>{car.requested_by || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                background: car.availability_status === 'Available' ? 'rgba(46, 204, 113, 0.2)' : (car.availability_status === 'Pending' ? 'rgba(241, 196, 15, 0.2)' : 'rgba(231, 76, 60, 0.2)'),
                                                color: car.availability_status === 'Available' ? '#2ecc71' : (car.availability_status === 'Pending' ? '#f1c40f' : '#e74c3c')
                                            }}>
                                                {car.availability_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', minWidth: '160px' }}>
                                            <details>
                                                <summary className="btn" style={{ listStyle: 'none', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', display: 'inline-block' }}>
                                                    Select Action ▼
                                                </summary>
                                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                    {car.availability_status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => updateStatusHandler(car._id, 'Unavailable')} className="btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #00b09b, #96c93d)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(0, 176, 155, 0.4)', fontWeight: 'bold' }}>Approve</button>
                                                            <button onClick={() => updateStatusHandler(car._id, 'Available')} className="btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)', fontWeight: 'bold' }}>Reject</button>
                                                        </>
                                                    )}
                                                    {car.availability_status === 'Unavailable' && (
                                                        <button onClick={() => updateStatusHandler(car._id, 'Available')} className="btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #00E5FF, #0088cc)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)', fontWeight: 'bold' }}>Mark Returned</button>
                                                    )}
                                                    <button onClick={() => deleteCarHandler(car._id)} className="btn" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }}>Delete Vehicle</button>
                                                </div>
                                            </details>
                                        </td>
                                    </tr>
                                ))}
                                {cars.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>No vehicles found in inventory.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showAddForm && (
                    <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Add Vehicle Listing</h2>

                        <form onSubmit={handleAddCar}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Car Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Brand</label>
                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Model Year</label>
                                    <input type="number" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Price Per Day (₹)</label>
                                    <input type="number" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: '1 1 150px' }}>
                                    <label>Transmission</label>
                                    <input type="text" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: '1 1 150px' }}>
                                    <label>Fuel Type</label>
                                    <input type="text" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ flex: '1 1 150px' }}>
                                    <label>Seating Capacity</label>
                                    <input type="number" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Image <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Upload)</span></label>
                                    <input type="file" onChange={uploadFileHandler} accept="image/*" style={{ border: 'none', background: 'transparent', padding: '0.8rem 0' }} />
                                    {uploading && <small style={{ color: 'var(--accent)' }}>Uploading...</small>}
                                </div>
                                <div className="form-group" style={{ flex: '1 1 200px' }}>
                                    <label>Availability</label>
                                    <select value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', color: 'var(--text-color)' }}>
                                        <option value="Available">Available</option>
                                        <option value="Unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" style={{ width: '100%' }}></textarea>
                            </div>

                            <button type="submit" className="btn" style={{ width: '100%' }}>Save Listing</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
