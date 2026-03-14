import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Star } from 'lucide-react';

const AddCarPage = () => {
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
    const [currentStep, setCurrentStep] = useState(1);

    const steps = ['Basic Info', 'Specifications', 'Registration & Details', 'Media'];

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

    const nextStep = (e) => { if (e) e.preventDefault(); setCurrentStep(prev => Math.min(prev + 1, steps.length)); };
    const prevStep = (e) => { if (e) e.preventDefault(); setCurrentStep(prev => Math.max(prev - 1, 1)); };

    const handleAddCar = async (e) => {
        e.preventDefault();
        if (currentStep !== steps.length) return nextStep();
        try {
            const payload = {
                ...formData,
                image_url: images.length > 0 ? images[0] : '',
                secondary_images: images.length > 1 ? images.slice(1) : []
            };
            const token = localStorage.getItem('adminToken');
            await api.post('/api/admin/add-car', payload, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Vehicle added successfully!');
            navigate('/admin/dashboard');
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
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block', marginBottom: '0.4rem',
        fontSize: '0.78rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
    };

    const Field = ({ label, children }) => (
        <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: 'var(--bg-color)',
            padding: '2rem 5%',
            margin: '-2rem -6%',
            color: 'var(--text-main)',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif", color: 'var(--text-main)' }}>
                        Add New Vehicle
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Enter the details below to add a new car to the dealership catalogue.
                    </p>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} className="btn btn-slate"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </button>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '640px' }}>
                    {steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: currentStep >= idx + 1 ? 'var(--accent)' : 'var(--surface)',
                                    border: currentStep >= idx + 1 ? 'none' : '1px solid var(--glass-border)',
                                    color: currentStep >= idx + 1 ? '#fff' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s',
                                    boxShadow: currentStep >= idx + 1 ? '0 4px 12px var(--accent-glow)' : 'none'
                                }}>
                                    {idx + 1}
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600,
                                    color: currentStep >= idx + 1 ? 'var(--text-main)' : 'var(--text-muted)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {step}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div style={{
                                    flex: 1, height: '2px', margin: '0 0.75rem',
                                    marginBottom: '1.2rem',
                                    background: currentStep > idx + 1 ? 'var(--accent)' : 'var(--glass-border)',
                                    transition: 'background 0.3s', borderRadius: '2px'
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── FORM CARD ── */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>

                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <div>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Basic Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                                    <Field label="Car Name">
                                        <input style={inputStyle} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Model 3" />
                                    </Field>
                                    <Field label="Brand">
                                        <input style={inputStyle} type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required placeholder="e.g. Tesla" />
                                    </Field>
                                    <Field label="Model Year">
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required placeholder="e.g. 2023" />
                                    </Field>
                                    <Field label="Price (₹)">
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required placeholder="e.g. 4500000" />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <div>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Specifications
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                                    <Field label="Transmission">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required>
                                            <option value="" style={{ background: '#1c2a38' }}>Select...</option>
                                            <option value="Automatic" style={{ background: '#1c2a38' }}>Automatic</option>
                                            <option value="Manual" style={{ background: '#1c2a38' }}>Manual</option>
                                            <option value="CVT" style={{ background: '#1c2a38' }}>CVT</option>
                                            <option value="EV" style={{ background: '#1c2a38' }}>EV (Single Speed)</option>
                                        </select>
                                    </Field>
                                    <Field label="Fuel Type">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required>
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
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required placeholder="e.g. 5" />
                                    </Field>
                                    <Field label="Range / Mileage">
                                        <input style={inputStyle} type="text" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} placeholder="e.g. 350km or 18kmpl" />
                                    </Field>
                                    <Field label="Odometer (km)">
                                        <input style={inputStyle} type="text" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} placeholder="e.g. 15,000 km" />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <div>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Registration & Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                                    <Field label="Exterior Color">
                                        <input style={inputStyle} type="text" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} placeholder="e.g. Pearl White" />
                                    </Field>
                                    <Field label="Interior Color">
                                        <input style={inputStyle} type="text" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} placeholder="e.g. Black" />
                                    </Field>
                                    <Field label="Number of Owners">
                                        <input style={inputStyle} type="number" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value })} placeholder="e.g. 1" />
                                    </Field>
                                    <Field label="Registration City">
                                        <input style={inputStyle} type="text" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} placeholder="e.g. Hyderabad" />
                                    </Field>
                                    <Field label="Insurance Validity">
                                        <input style={inputStyle} type="text" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} placeholder="e.g. Dec 2025" />
                                    </Field>
                                    <Field label="Availability">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                            <option value="Available" style={{ background: '#1c2a38' }}>Available</option>
                                            <option value="Unavailable" style={{ background: '#1c2a38' }}>Unavailable</option>
                                        </select>
                                    </Field>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Field label="Description">
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="3"
                                                placeholder="Brief description of the vehicle..."
                                                style={{ ...inputStyle, resize: 'vertical' }}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4 */}
                        {currentStep === 4 && (
                            <div>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Vehicle Media
                                </h3>

                                {/* Upload zone */}
                                <div style={{ position: 'relative', border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '2.5rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: '1.5rem', transition: 'border-color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(58,123,213,0.4)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                >
                                    <input type="file" multiple onChange={uploadFileHandler} accept="image/*"
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Click or Drag & Drop images here</p>
                                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG, WEBP supported</p>
                                </div>

                                {uploading && (
                                    <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        Uploading files, please wait...
                                    </p>
                                )}

                                {images.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                                            Uploaded Images — First image is the cover
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
                                            {images.map((img, index) => (
                                                <div key={index} style={{
                                                    borderRadius: '10px', overflow: 'hidden',
                                                    border: index === 0 ? '2px solid #22c55e' : '1px solid var(--glass-border)',
                                                    background: 'var(--surface)', position: 'relative'
                                                }}>
                                                    {index === 0 && (
                                                        <div style={{ position: 'absolute', top: 0, left: 0, background: '#22c55e', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.5rem', fontWeight: 800, letterSpacing: '0.5px', zIndex: 2 }}>
                                                            PRIMARY
                                                        </div>
                                                    )}
                                                    <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.6rem', background: 'rgba(0,0,0,0.3)' }}>
                                                        <button type="button" onClick={() => makePrimary(index)} disabled={index === 0}
                                                            style={{ border: 'none', background: 'transparent', color: index === 0 ? 'var(--text-muted)' : 'var(--accent-light)', fontSize: '0.75rem', cursor: index === 0 ? 'default' : 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <Star size={11} /> Cover
                                                        </button>
                                                        <button type="button" onClick={() => removeImage(index)}
                                                            style={{ border: 'none', background: 'transparent', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <X size={11} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── NAVIGATION BUTTONS ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 2rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="button" onClick={prevStep} disabled={currentStep === 1}
                            className="btn btn-slate"
                            style={{ opacity: currentStep === 1 ? 0.4 : 1, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}>
                            ← Previous
                        </button>
                        <button type="submit" disabled={uploading} className="btn"
                            style={{
                                background: currentStep === steps.length ? '#22c55e' : 'var(--accent)',
                                opacity: uploading ? 0.6 : 1,
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                padding: '0.6rem 2.5rem', fontWeight: 700
                            }}>
                            {currentStep === steps.length ? (uploading ? 'Processing...' : '✓ Save Vehicle') : 'Next Step →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCarPage;