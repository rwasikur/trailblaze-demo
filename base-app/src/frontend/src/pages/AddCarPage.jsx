import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const AddCarPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '', price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '', number_of_owners: '', registration_city: '', insurance_validity: '', description: '', availability_status: 'Available'
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
        newImages.unshift(selected); // move to front
        setImages(newImages);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const prevStep = (e) => {
        if (e) e.preventDefault();
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleAddCar = async (e) => {
        e.preventDefault();

        if (currentStep !== steps.length) {
            return nextStep();
        }

        try {
            const payload = {
                ...formData,
                image_url: images.length > 0 ? images[0] : '',
                secondary_images: images.length > 1 ? images.slice(1) : []
            };

            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/admin/add-car', payload, config);
            toast.success('Vehicle added successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 66px)',
            position: 'relative',
            padding: '2rem 5% 4rem 5%',
            margin: '-2rem -6%',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>

            <style>{`
                .admin-light-panel { color: #000; }
                .admin-light-panel label { color: #2D3748 !important; font-weight: 600; font-size: 0.8rem; }
                .admin-light-panel input, .admin-light-panel textarea, .admin-light-panel select { color: #000 !important; background: rgba(0,0,0,0.05) !important; border-color: #ccc !important; padding: 0.5rem !important; }
            `}</style>

            <div className="admin-light-panel" style={{ width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexShrink: 0, paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h1 className="page-title" style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.5px', textShadow: 'none', textAlign: 'left' }}>Add New Vehicle</h1>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Enter the details below to add a new car to the dealership catalogue.</p>
                    </div>
                    <button onClick={() => navigate('/admin/dashboard')} className="btn" style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Back to Dashboard</button>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '80%', maxWidth: '700px' }}>
                        {steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: currentStep >= idx + 1 ? '#0f172a' : '#e2e8f0', color: currentStep >= idx + 1 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s ease', boxShadow: currentStep >= idx + 1 ? '0 4px 6px -1px rgba(15, 23, 42, 0.2)' : 'none' }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600, color: currentStep >= idx + 1 ? '#0f172a' : '#94a3b8', transition: 'all 0.3s ease' }}>{step}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div style={{ flex: 1, height: '3px', backgroundColor: currentStep > idx + 1 ? '#0f172a' : '#e2e8f0', margin: '0 1rem', transform: 'translateY(-12px)', transition: 'all 0.3s ease', borderRadius: '3px' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div style={{ animation: 'fadeIn 0.3s ease-out', flex: 1, overflowY: 'auto', padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1 }}>
                            {currentStep === 1 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', padding: '1rem' }}>
                                    <h3 style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>Basic Information</h3>
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
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1rem' }}>
                                    <h3 style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>Specifications</h3>
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
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1rem' }}>
                                    <h3 style={{ gridColumn: '1 / -1', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>Registration & Details</h3>
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
                                        <select value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', appearance: 'none' }}>
                                            <option value="Available">Available</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                        <label>Description</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" style={{ width: '100%', resize: 'vertical' }}></textarea>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div style={{ display: 'grid', gap: '1.5rem', padding: '1rem', flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>Vehicle Media</h3>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Upload Images <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(Drag & Drop or Click)</span></label>
                                        <div style={{ border: '2px dashed #cbd5e1', padding: '2rem 1rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#f8fafc', position: 'relative', transition: 'border-color 0.2s', ':hover': { borderColor: '#94a3b8' } }}>
                                            <input type="file" multiple onChange={uploadFileHandler} accept="image/*" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                                            <div style={{ color: '#475569', pointerEvents: 'none' }}>
                                                <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>📸</p>
                                                <p style={{ margin: 0, fontWeight: 600 }}>Click or Drag & Drop images here</p>
                                            </div>
                                        </div>
                                        {uploading && <small style={{ color: '#059669', fontWeight: 'bold', display: 'block', margin: '1rem 0' }}>Uploading files, please wait...</small>}

                                        {images.length > 0 && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: 600 }}>Uploaded Views (First image is the cover)</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                                    {images.map((img, index) => (
                                                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: index === 0 ? '3px solid #059669' : '1px solid #cbd5e1', background: '#fff' }}>
                                                            {index === 0 && <div style={{ position: 'absolute', top: 0, left: 0, background: '#059669', color: '#fff', fontSize: '0.65rem', padding: '0.3rem 0.6rem', fontWeight: 'bold', borderBottomRightRadius: '8px', zIndex: 10 }}>PRIMARY</div>}
                                                            <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f1f5f9' }}>
                                                                <button type="button" onClick={() => makePrimary(index)} disabled={index === 0} style={{ border: 'none', background: 'transparent', color: index === 0 ? '#94a3b8' : '#3b82f6', fontSize: '0.8rem', cursor: index === 0 ? 'default' : 'pointer', fontWeight: 'bold', padding: 0 }}>Make Cover</button>
                                                                <button type="button" onClick={() => removeImage(index)} style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>Remove</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                style={{ padding: '0.6rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: currentStep === 1 ? 'not-allowed' : 'pointer', opacity: currentStep === 1 ? 0.5 : 1 }}
                            >
                                Previous
                            </button>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn"
                                style={{ padding: '0.6rem 2.5rem', borderRadius: '8px', background: currentStep === steps.length ? '#059669' : '#0f172a', color: '#ffffff', fontWeight: 600, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
                            >
                                {currentStep === steps.length ? (uploading ? 'Processing...' : 'Save Vehicle to Fleet') : 'Next Step'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCarPage;
