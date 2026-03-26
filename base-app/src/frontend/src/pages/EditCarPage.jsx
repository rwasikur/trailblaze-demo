import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const EditCarPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '',
        price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '',
        number_of_owners: '', registration_city: '', insurance_validity: '', description: '',
        availability_status: 'Available', image_url: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const { data } = await api.get(`/api/cars/${id}`);
                setFormData({
                    name: data.name || '',
                    brand: data.brand || '',
                    model_year: data.model_year || '',
                    transmission: data.transmission || '',
                    fuel_type: data.fuel_type || '',
                    seating_capacity: data.seating_capacity || '',
                    price_per_day: data.price_per_day || '',
                    range: data.range || '',
                    body_type: data.body_type || '',
                    mileage: data.mileage || '',
                    exterior_color: data.exterior_color || '',
                    interior_color: data.interior_color || '',
                    number_of_owners: data.number_of_owners || '',
                    registration_city: data.registration_city || '',
                    insurance_validity: data.insurance_validity || '',
                    description: data.description || '',
                    availability_status: data.availability_status || 'Available',
                    image_url: data.image_url || ''
                });
            } catch (error) {
                console.error('Error fetching car details', error);
                toast.error("Could not load car details for editing.");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleEditCar = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/api/cars/${id}`, formData, config);
            toast.success('Vehicle updated successfully!');
            navigate('/admin/inventory');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading details...</p>;

    return (
        <div style={{ height: 'calc(100vh - 66px)', position: 'relative', padding: '0.5rem 5% 1rem 5%', margin: '-2rem -6%', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .admin-light-panel { color: #000; }
                .admin-light-panel label { color: #2D3748 !important; font-weight: 600; font-size: 0.8rem; }
                .admin-light-panel input, .admin-light-panel textarea, .admin-light-panel select { color: #000 !important; background: rgba(0,0,0,0.05) !important; border-color: #ccc !important; padding: 0.5rem !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="admin-light-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: 700 }}>Edit Vehicle</h1>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Update vehicle metadata and availability status below.</p>
                    </div>
                    <button onClick={() => navigate('/admin/inventory')} className="btn" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Back to Inventory</button>
                </div>

                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                    <form onSubmit={handleEditCar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Car Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Brand</label>
                                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Model Year</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Price ($)</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Transmission</label>
                                <select value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'rgba(0,0,0,0.05)', color: '#000' }}>
                                    <option value="">Select</option>
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Fuel Type</label>
                                <input type="text" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Seating Capacity</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Range (e.g. 350km)</label>
                                <input type="text" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Body Type (e.g. SUV)</label>
                                <input type="text" value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Mileage (e.g. 15,000 km)</label>
                                <input type="text" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Exterior Color</label>
                                <select value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'rgba(0,0,0,0.05)', color: '#000' }}>
                                    <option value="">Select</option>
                                    <option value="Black">Black</option>
                                    <option value="White">White</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Grey">Grey</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Red">Red</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Interior Color</label>
                                <select value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: 'rgba(0,0,0,0.05)', color: '#000' }}>
                                    <option value="">Select</option>
                                    <option value="Black">Black</option>
                                    <option value="White">White</option>
                                    <option value="Beige">Beige</option>
                                    <option value="Brown">Brown</option>
                                    <option value="Grey">Grey</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Number of Owners</label>
                                <input type="number" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Registration City</label>
                                <input type="text" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Insurance Validity</label>
                                <input type="text" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Availability</label>
                                <select value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.05)', color: '#000', appearance: 'none' }}>
                                    <option value="Available">Available</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                <label>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" style={{ width: '100%', resize: 'vertical' }}></textarea>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                <label>Image URL</label>
                                <input type="text" placeholder="https://example.com/car-image.jpg" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-slate" style={{ flexShrink: 0, color: '#fff', width: '100%', marginTop: '1rem' }}>
                            Save Updates to Fleet
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCarPage;
