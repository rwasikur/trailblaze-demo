import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X, Star } from 'lucide-react';

const Field = ({ label, children }) => (
    <div style={{ marginBottom: 0 }}>
        <label style={{
            display: 'block', marginBottom: '0.4rem',
            fontSize: '0.78rem', fontWeight: 600,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>{label}</label>
        {children}
    </div>
);

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
                const { data } = await api.post('/api/upload', formDataUpload);
                uploadedUrls.push(`${import.meta.env.VITE_API_URL || ''}${data.url}`);
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
        width: '100%', padding: '0.75rem 1rem',
        background: '#f8fafc',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px', color: 'var(--text-main)',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem',
        outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s'
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 66px)',
            backgroundColor: 'var(--bg-color)',
            padding: '1.5rem 3%',
            margin: '0 auto',
            color: 'var(--text-main)',
            display: 'flex', flexDirection: 'column',
            maxWidth: '1350px'
        }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
                        Add New Vehicle
                    </h1>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} className="btn btn-slate"
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
                    {steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: currentStep >= idx + 1 ? 'var(--accent)' : 'var(--surface)',
                                    border: currentStep >= idx + 1 ? 'none' : '1px solid var(--glass-border)',
                                    color: currentStep >= idx + 1 ? '#fff' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.3s'
                                }}>
                                    {idx + 1}
                                </div>
                                <span style={{
                                    fontSize: '0.68rem', marginTop: '0.25rem', fontWeight: 600,
                                    color: currentStep >= idx + 1 ? 'var(--text-main)' : 'var(--text-muted)'
                                }}>
                                    {step}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div style={{
                                    flex: 1, height: '2px', margin: '0 0.5rem',
                                    marginBottom: '0.9rem',
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
                borderRadius: '12px',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.25rem 2rem' }}>

                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <div>
                                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Basic Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <Field label="Car Name">
                                        <input style={inputStyle} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Model 3" />
                                    </Field>
                                    <Field label="Brand">
                                        <input style={inputStyle} type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required placeholder="e.g. Tesla" />
                                    </Field>
                                    <Field label="Model Year">
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required placeholder="e.g. 2023" />
                                    </Field>
                                    <Field label="Price ($)">
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required placeholder="e.g. 4500" />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <div>
                                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Specifications
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <Field label="Transmission">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required>
                                            <option value="">Select...</option>
                                            <option value="Automatic">Automatic</option>
                                            <option value="Manual">Manual</option>
                                            <option value="CVT">CVT</option>
                                            <option value="EV">EV (Single Speed)</option>
                                        </select>
                                    </Field>
                                    <Field label="Fuel Type">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required>
                                            <option value="">Select...</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </Field>
                                    <Field label="Body Type">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}>
                                            <option value="">Select...</option>
                                            <option value="Sedan">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Hatchback">Hatchback</option>
                                            <option value="Luxury">Luxury</option>
                                            <option value="Sports">Sports</option>
                                            <option value="MUV">MUV</option>
                                            <option value="Coupe">Coupe</option>
                                        </select>
                                    </Field>
                                    <Field label="Seating Capacity">
                                        <input style={inputStyle} type="text" inputMode="numeric" pattern="[0-9]*" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required placeholder="e.g. 5" />
                                    </Field>
                                    <Field label="Range / Mileage">
                                        <input style={inputStyle} type="text" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} placeholder="e.g. 350km" />
                                    </Field>
                                    <Field label="Odometer (km)">
                                        <input style={inputStyle} type="text" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} placeholder="e.g. 15,000" />
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <div>
                                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Registration & Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <Field label="Exterior Color">
                                        <input style={inputStyle} type="text" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} placeholder="e.g. White" />
                                    </Field>
                                    <Field label="Interior Color">
                                        <input style={inputStyle} type="text" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} placeholder="e.g. Black" />
                                    </Field>
                                    <Field label="Number of Owners">
                                        <input style={inputStyle} type="number" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value })} placeholder="e.g. 1" />
                                    </Field>
                                    <Field label="Registration City">
                                        <input style={inputStyle} type="text" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} placeholder="e.g. Mumbai" />
                                    </Field>
                                    <Field label="Insurance Validity">
                                        <input style={inputStyle} type="text" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} placeholder="e.g. 2025" />
                                    </Field>
                                    <Field label="Availability">
                                        <select style={{ ...inputStyle, appearance: 'none' }} value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                            <option value="Available">Available</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </Field>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Field label="Description">
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="2"
                                                placeholder="Brief description..."
                                                style={{ ...inputStyle, resize: 'none' }}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4 */}
                        {currentStep === 4 && (
                            <div>
                                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    Vehicle Media
                                </h3>

                                <div style={{ position: 'relative', border: '1px dashed var(--glass-border)', borderRadius: '10px', padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', marginBottom: '1rem' }}>
                                    <input type="file" multiple onChange={uploadFileHandler} accept="image/*"
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>Upload images</p>
                                </div>

                                {uploading && (
                                    <p style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                        Uploading...
                                    </p>
                                )}

                                {images.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                        {images.map((img, index) => (
                                            <div key={index} style={{
                                                borderRadius: '8px', overflow: 'hidden',
                                                border: index === 0 ? '2px solid #22c55e' : '1px solid var(--glass-border)',
                                                background: 'var(--surface)', position: 'relative'
                                            }}>
                                                <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '70px', objectFit: 'cover', display: 'block' }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0.4rem', background: 'rgba(0,0,0,0.3)' }}>
                                                    <button type="button" onClick={() => makePrimary(index)} disabled={index === 0}
                                                        style={{ border: 'none', background: 'transparent', color: index === 0 ? '#94a3b8' : '#3b82f6', fontSize: '0.6rem', fontWeight: 600 }}>
                                                        Cover
                                                    </button>
                                                    <button type="button" onClick={() => removeImage(index)}
                                                        style={{ border: 'none', background: 'transparent', color: '#f87171', fontSize: '0.6rem', fontWeight: 600 }}>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── NAVIGATION BUTTONS ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 2rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="button" onClick={prevStep} disabled={currentStep === 1}
                            className="btn btn-slate"
                            style={{ opacity: currentStep === 1 ? 0.4 : 1, padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}>
                            ← Previous
                        </button>
                        <button type="submit" disabled={uploading} className="btn"
                            style={{
                                background: currentStep === steps.length ? '#22c55e' : 'var(--accent)',
                                opacity: uploading ? 0.6 : 1,
                                padding: '0.4rem 2rem', fontWeight: 700, fontSize: '0.8rem'
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