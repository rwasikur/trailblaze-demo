import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', price: '', mileage: '', description: '', imageUrl: ''
    });
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:8000/api/admin/cars', formData, config);
            setStatusMsg('Vehicle added successfully!');
            setFormData({ make: '', model: '', year: '', price: '', mileage: '', description: '', imageUrl: '' });
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (err) {
            setStatusMsg('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{
            margin: '-2rem -5.5% -2rem -5.5%',
            minHeight: 'calc(100vh - 84px)',
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

                <div className="glass-panel" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Add Vehicle Listing</h2>
                    {statusMsg && <div style={{ marginBottom: '1rem', color: statusMsg.includes('Error') ? 'var(--accent)' : '#2e86de' }}>{statusMsg}</div>}

                    <form onSubmit={handleAddCar}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Make</label>
                                <input type="text" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} required placeholder="e.g. BMW" />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Model</label>
                                <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required placeholder="e.g. M3" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Year</label>
                                <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Price ($)</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Mileage</label>
                                <input type="number" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Cover Image URL</label>
                            <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" style={{ width: '100%' }} placeholder="Car details..."></textarea>
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%' }}>Save Listing</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
