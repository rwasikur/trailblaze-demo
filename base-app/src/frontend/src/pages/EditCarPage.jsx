import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Star } from 'lucide-react';

const EditCarPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '',
        seating_capacity: '', price_per_day: '', range: '', body_type: '',
        mileage: '', exterior_color: '', interior_color: '', number_of_owners: '',
        registration_city: '', insurance_validity: '', description: '',
        availability_status: 'Available'
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
                uploadedUrls.push(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${data.url}`);
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
        setImages(images.filter((_, i) => i !== index));
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
            await api.put(`/api/admin/cars/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Vehicle updated successfully!');
            navigate('/admin/inventory');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.7rem 1rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px', color: 'var(--text-main)',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
        outline: 'none', boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block', marginBottom: '0.4rem',
        fontSize: '0.78rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
    };

    const Field = ({ label, children, wide }) => (
        <div style={{ gridColumn: wide ? '1 / -1' : undefined, marginBottom: 0 }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
            Loading vehicle details...
        </div>
    );

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: 'var(--bg-color)',
            padding: '2rem 5%',
            margin: '-2rem -6%',
            color: 'var(--text-main)'
        }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif", color: 'var(--text-main)' }}>
                        Edit Vehicle
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Update vehicle metadata and availability status below.
                    </p>
                </div>
                <button onClick={() => navigate('/admin/inventory')} className="btn btn-slate"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <ArrowLeft size={15} /> Back to Inventory
                </button>
            </div>

            {/* ── FORM CARD ── */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '2rem' }}>
                <form onSubmit={handleEditCar}>
                    {/* Section: Basic */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '0.6rem', borderBottom: '1px solid var(--glass-border)' }}>
                            Basic Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            <Field label="Car Name">
                                <input style={inputStyle} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </Field>
                            <Field label="Brand">
                                <input style={inputStyle} type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                            </Field>
                            <Field label="Model Year">
                                <input style={inputStyle} type="text" inputMode="numeric" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                            </Field>
                            <Field label="Price (₹)">
                                <input style={inputStyle} type="text" inputMode="numeric" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
                            </Field>
                            <Field label="Availability">
                                <select style={{ ...inputStyle, appearance: 'none' }} value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                    <option value="Available" style={{ background: '#1c2a38' }}>Available</option>
                                    <option value="Pending" style={{ background: '#1c2a38' }}>Pending</option>
                                    <option value="Unavailable" style={{ background: '#1c2a38' }}>Unavailable</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Section: Specs */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '0.6rem', borderBottom: '1px solid var(--glass-border)' }}>
                            Specifications
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            <Field label="Transmission">
                                <select style={{ ...inputStyle, appearance: 'none' }} value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}>
                                    <option value="" style={{ background: '#1c2a38' }}>Select...</option>
                                    <option value="Automatic" style={{ background: '#1c2a38' }}>Automatic</option>
                                    <option value="Manual" style={{ background: '#1c2a38' }}>Manual</option>
                                    <option value="CVT" style={{ background: '#1c2a38' }}>CVT</option>
                                    <option value="EV" style={{ background: '#1c2a38' }}>EV (Single Speed)</option>
                                </select>
                            </Field>
                            <Field label="Fuel Type">
                                <select style={{ ...inputStyle, appearance: 'none' }} value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}>
                                    <option value="" style={{ background: '#1c2a38' }}>Select...</option>
                                    <option value="Petrol" style={{ background: '#1c2a38' }}>Petrol</option>
                                    <option value="Diesel" style={{ background: '#1c2a38' }}>Diesel</option>
                                    <option value="Electric" style={{ background: '#1c2a38' }}>Electric</option>
                                    <option value="Hybrid" style={{ background: '#1c2a38' }}>Hybrid</option>
                                    <option value="CNG" style={{ background: '#1c2a38' }}>CNG</option>
                                </select>
                            </Field>
                            <Field label="Body Type">
                                <select style={{ ...inputStyle, appearance: 'none' }} value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}>
                                    <option value="" style={{ background: '#1c2a38' }}>Select...</option>
                                    <option value="Sedan" style={{ background: '#1c2a38' }}>Sedan</option>
                                    <option value="SUV" style={{ background: '#1c2a38' }}>SUV</option>
                                    <option value="Hatchback" style={{ background: '#1c2a38' }}>Hatchback</option>
                                    <option value="Luxury" style={{ background: '#1c2a38' }}>Luxury</option>
                                    <option value="Sports" style={{ background: '#1c2a38' }}>Sports</option>
                                    <option value="MUV" style={{ background: '#1c2a38' }}>MUV</option>
                                    <option value="Coupe" style={{ background: '#1c2a38' }}>Coupe</option>
                                </select>
                            </Field>
                            <Field label="Seating Capacity">
                                <input style={inputStyle} type="text" inputMode="numeric" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} />
                            </Field>
                            <Field label="Range / Mileage">
                                <input style={inputStyle} type="text" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                            </Field>
                            <Field label="Odometer (km)">
                                <input style={inputStyle} type="text" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
                            </Field>
                        </div>
                    </div>

                    {/* Section: Registration */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '0.6rem', borderBottom: '1px solid var(--glass-border)' }}>
                            Registration & Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                            <Field label="Exterior Color">
                                <input style={inputStyle} type="text" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} />
                            </Field>
                            <Field label="Interior Color">
                                <input style={inputStyle} type="text" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} />
                            </Field>
                            <Field label="Number of Owners">
                                <input style={inputStyle} type="number" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value })} />
                            </Field>
                            <Field label="Registration City">
                                <input style={inputStyle} type="text" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                            </Field>
                            <Field label="Insurance Validity">
                                <input style={inputStyle} type="text" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} />
                            </Field>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Description">
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3"
                                        style={{ ...inputStyle, resize: 'vertical' }} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Section: Images */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '0.6rem', borderBottom: '1px solid var(--glass-border)' }}>
                            Vehicle Images
                        </h3>
                        <div style={{ position: 'relative', border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: '1.25rem' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(58,123,213,0.4)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                            <input type="file" multiple onChange={uploadFileHandler} accept="image/*"
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                            <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Click or Drag & Drop to upload more images</p>
                        </div>

                        {uploading && <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>Uploading...</p>}

                        {images.length > 0 && (
                            <div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                                    Uploaded Images — First image is the cover
                                </p>
                                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                                    {images.map((img, index) => (
                                        <div key={index} style={{
                                            width: '160px', borderRadius: '10px', overflow: 'hidden',
                                            border: index === 0 ? '2px solid #22c55e' : '1px solid var(--glass-border)',
                                            background: 'var(--surface)', position: 'relative', flexShrink: 0
                                        }}>
                                            {index === 0 && (
                                                <div style={{ position: 'absolute', top: 0, left: 0, background: '#22c55e', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.5rem', fontWeight: 800, zIndex: 2 }}>
                                                    PRIMARY
                                                </div>
                                            )}
                                            <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.3)' }}>
                                                <button type="button" onClick={() => makePrimary(index)} disabled={index === 0}
                                                    style={{ border: 'none', background: 'transparent', color: index === 0 ? 'var(--text-muted)' : 'var(--accent-light)', fontSize: '0.72rem', cursor: index === 0 ? 'default' : 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Star size={10} /> Cover
                                                </button>
                                                <button type="button" onClick={() => removeImage(index)}
                                                    style={{ border: 'none', background: 'transparent', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <X size={10} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn" disabled={uploading}
                        style={{
                            width: '100%', padding: '0.85rem',
                            fontSize: '0.95rem', fontWeight: 700,
                            background: '#22c55e',
                            opacity: uploading ? 0.6 : 1,
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            borderRadius: '10px'
                        }}>
                        {uploading ? 'Processing Images...' : '✓ Save Updates to Fleet'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCarPage;