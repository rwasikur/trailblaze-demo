import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const EditCarPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '', price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '', number_of_owners: '', registration_city: '', insurance_validity: '', description: '', availability_status: 'Available'
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
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
                    availability_status: data.availability_status || 'Available'
                });

                const loadedImages = [];
                if (data.image_url) loadedImages.push(data.image_url);
                if (data.secondary_images && Array.isArray(data.secondary_images)) {
                    loadedImages.push(...data.secondary_images);
                }
                setImages(loadedImages);

            } catch (error) {
                console.error('Error fetching car details', error);
                toast.error("Could not load car details for editing.");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const uploadFileHandler = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);
                const { data } = await api.post('/api/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedUrls.push(`${import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000'}${data.url}`);
            }
            setImages([...images, ...uploadedUrls]);
            toast.success("Image(s) uploaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const makePrimary = (index) => {
        if (index === 0) return;
        const newImages = [...images];
        const [selected] = newImages.splice(index, 1);
        newImages.unshift(selected);
        setImages(newImages);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleEditCar = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                image_url: images.length > 0 ? images[0] : '',
                secondary_images: images.length > 1 ? images.slice(1) : []
            };

            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/api/admin/cars/${id}`, payload, config);
            toast.success('Vehicle updated successfully!');
            navigate('/admin/inventory');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading details...</p>;

    return (
        <div style={{
            height: 'calc(100vh - 66px)',
            position: 'relative',
            padding: '2rem 5% 4rem 5%',
            margin: '-2rem -6%',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, sans-serif'
        }}>
            <style>{`
                .admin-light-panel { color: #000; }
                .admin-light-panel label { color: #2D3748 !important; font-weight: 600; font-size: 0.8rem; }
                .admin-light-panel input, .admin-light-panel textarea, .admin-light-panel select { color: #000 !important; background: rgba(0,0,0,0.05) !important; border-color: #ccc !important; padding: 0.5rem !important; }
            `}</style>

            <div className="admin-light-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexShrink: 0 }}>
                    <div>
                        <h1 className="page-title" style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.5px', textShadow: 'none', textAlign: 'left' }}>Edit</h1>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Update vehicle metadata and availability status below.</p>
                    </div>
                    <button onClick={() => navigate('/admin/inventory')} className="btn" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Back to Inventory</button>
                </div>

                <div style={{ animation: 'fadeIn 0.3s ease-out', flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
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
                                <label>Price (₹)</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Transmission</label>
                                <input type="text" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required />
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
                                <input type="text" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Interior Color</label>
                                <input type="text" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} />
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
                                <select value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#000', appearance: 'none' }}>
                                    <option value="Available" style={{ color: '#000' }}>Available</option>
                                    <option value="Pending" style={{ color: '#000' }}>Pending</option>
                                    <option value="Unavailable" style={{ color: '#000' }}>Unavailable</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                <label>Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="1" style={{ width: '100%', resize: 'vertical' }}></textarea>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                <label>Vehicle Images <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Drag & Drop or Click to Upload Multiple Views)</span></label>
                                <div style={{ border: '2px dashed #9ca3af', padding: '1rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: 'rgba(0,0,0,0.02)', position: 'relative', marginBottom: '1rem' }}>
                                    <input type="file" multiple onChange={uploadFileHandler} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                                    <div style={{ color: '#555', pointerEvents: 'none' }}>
                                        <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>📸</p>
                                        <p style={{ margin: 0, fontWeight: 600 }}>Click or Drag & Drop images here</p>
                                    </div>
                                </div>
                                {uploading && <small style={{ color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginBottom: '1rem' }}>Uploading...</small>}

                                {images.length > 0 && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>Uploaded Views (First image is the Catalogue Cover)</label>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {images.map((img, index) => (
                                                <div key={index} style={{ position: 'relative', width: '160px', borderRadius: '8px', overflow: 'hidden', border: index === 0 ? '3px solid #059669' : '1px solid #cbd5e1', background: '#fff' }}>
                                                    {index === 0 && <div style={{ position: 'absolute', top: 0, left: 0, background: '#059669', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.5rem', fontWeight: 'bold', borderBottomRightRadius: '8px', zIndex: 10 }}>PRIMARY</div>}
                                                    <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: '#f1f5f9' }}>
                                                        <button type="button" onClick={() => makePrimary(index)} disabled={index === 0} style={{ border: 'none', background: 'transparent', color: index === 0 ? '#cbd5e1' : '#3b82f6', fontSize: '0.75rem', cursor: index === 0 ? 'default' : 'pointer', fontWeight: 'bold', padding: 0 }}>Cover</button>
                                                        <button type="button" onClick={() => removeImage(index)} style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-slate" disabled={uploading} style={{ flexShrink: 0, color: '#fff', width: '100%', opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}>
                            {uploading ? 'Processing Image(s)...' : 'Save Updates to Fleet'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCarPage;
