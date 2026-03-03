import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AddCarPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '', price_per_day: '', description: '', image_url: '', availability_status: 'Available'
    });
    const [uploading, setUploading] = useState(false);

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

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/admin/add-car', formData, config);
            toast.success('Vehicle added successfully!');
            navigate('/admin/dashboard'); // Redirect immediately back to inventory
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
                    <h1 className="page-title" style={{ margin: 0, fontSize: '2.5rem' }}>Add New Vehicle</h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>&larr; Back to Dashboard</button>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
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

                        <button type="submit" className="btn" style={{ width: '100%' }}>Save Listing to Fleet</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCarPage;
