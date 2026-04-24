import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

import { BRANDS_MODELS, EXTERIOR_COLORS, INTERIOR_COLORS } from '../constants/carData';

const AddCarPage = () => {
    const navigate = useNavigate();
    const mainFileRef = useRef(null);
    const multiFileRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '',
        price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '',
        number_of_owners: 0, registration_city: '', insurance_validity: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], description: '',
        availability_status: 'Available', image_url: '', secondary_images: [], condition: 'New'
    });

    const [uploadMethod] = useState('local'); // Locked to 'local' upload
    const [mainLoading, setMainLoading] = useState(false);
    const [multiLoading, setMultiLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = ['Basic Info', 'Specifications', 'Registration & Details', 'Media'];

    const brands = Object.keys(BRANDS_MODELS).sort();
    const models = formData.brand ? BRANDS_MODELS[formData.brand] : [];

    const handleMainFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMainLoading(true);
        const data = new FormData();
        data.append('car_image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await api.post('/api/cars/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
            toast.success('Main image uploaded');
        } catch (err) {
            toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setMainLoading(false);
        }
    };

    const handleMultiFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setMultiLoading(true);
        const data = new FormData();
        files.forEach(file => data.append('secondary_images', file));

        try {
            const token = localStorage.getItem('adminToken');
            const res = await api.post('/api/cars/upload-multiple', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFormData(prev => ({
                ...prev,
                secondary_images: [...prev.secondary_images, ...res.data.urls]
            }));
            toast.success(`${res.data.urls.length} images added to gallery`);
        } catch (err) {
            toast.error('Gallery upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setMultiLoading(false);
        }
    };

    const removeSecondaryImage = (idx) => {
        setFormData(prev => ({
            ...prev,
            secondary_images: prev.secondary_images.filter((_, i) => i !== idx)
        }));
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();

        // Step 1 Validation
        if (currentStep === 1) {
            const price = parseInt(formData.price_per_day);
            if (isNaN(price) || price < 100) {
                toast.error('Price must be at least $100');
                return;
            }
            if (price > 10000000) { // $10M max for ultra-luxury
                toast.error('Price exceeds maximum allowed limit ($10,000,000)');
                return;
            }
            if (!formData.brand || !formData.name || !formData.model_year) {
                toast.error('Please fill in all basic information');
                return;
            }
            const year = parseInt(formData.model_year);
            if (year < 1886 || year > new Date().getFullYear() + 1) {
                toast.error('Please enter a valid model year');
                return;
            }
        }

        // Step 2 Validation
        if (currentStep === 2) {
            if (!formData.transmission || !formData.fuel_type || !formData.seating_capacity) {
                toast.error('Please fill in all specifications');
                return;
            }
            if (parseInt(formData.seating_capacity) <= 0 || parseInt(formData.seating_capacity) > 60) {
                toast.error('Seating capacity must be between 1 and 60');
                return;
            }
        }

        // Step 3 Validation
        if (currentStep === 3) {
            if (formData.condition === 'Used' && parseInt(formData.number_of_owners) <= 0) {
                toast.error('Pre-owned vehicles must have at least 1 previous owner');
                return;
            }
            if (!formData.insurance_validity) {
                toast.error('Insurance validity date is required');
                return;
            }
            const validityDate = new Date(formData.insurance_validity);
            validityDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (validityDate < today) {
                toast.error('Insurance has already expired');
                return;
            }

            // Differentiation: New cars should have longer insurance
            if (formData.condition === 'New') {
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(today.getFullYear() + 1);
                oneYearFromNow.setHours(0, 0, 0, 0);
                if (validityDate < oneYearFromNow) {
                    toast.error('New vehicles must have at least 1 year of valid insurance');
                    return;
                }
            }
        }

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

        // Final validation is now handled per-step in nextStep
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/api/cars', formData, config);
            toast.success('Vehicle added successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-full bg-slate-50 py-10 px-6 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto space-y-8 flex flex-col h-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Add New Vehicle</h1>
                        <p className="text-slate-500 mt-2 text-base">Enter the details below to add a new car to the dealership catalogue.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="text-sm font-semibold h-11 border-slate-300">
                        Back to Dashboard
                    </Button>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center shrink-0">
                    <div className="flex items-center w-full max-w-2xl">
                        {steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${currentStep >= idx + 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-xs mt-2 font-bold ${currentStep >= idx + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-4 -translate-y-3 rounded-full overflow-hidden bg-slate-200">
                                        <div className={`h-full bg-slate-900 transition-all duration-500 ease-in-out ${currentStep > idx + 1 ? 'w-full' : 'w-0'}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col min-h-0">
                    <CardContent className="p-0 flex flex-col h-full">
                        <form onSubmit={handleAddCar} className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 space-y-6">
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700">Vehicle Condition</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all" value={formData.condition} onChange={(e) => {
                                                    const isNew = e.target.value === 'New';
                                                    let insuranceVal = formData.insurance_validity;
                                                    if (isNew) {
                                                        const date = new Date();
                                                        date.setFullYear(date.getFullYear() + 1);
                                                        insuranceVal = date.toISOString().split('T')[0];
                                                    }
                                                    setFormData({
                                                        ...formData,
                                                        condition: e.target.value,
                                                        number_of_owners: isNew ? 0 : formData.number_of_owners,
                                                        insurance_validity: insuranceVal
                                                    });
                                                }} required>
                                                    <option value="New">Brand New (Showroom)</option>
                                                    <option value="Used">Pre-Owned (Secondary Market)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Brand</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, name: '' })} required>
                                                    <option value="">Select Brand</option>
                                                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Car Name</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!formData.brand} required>
                                                    <option value="">Select Model</option>
                                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <Input label="Model Year" type="number" min="1970" max={new Date().getFullYear() + 1} value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                                            <Input label="Price ($)" type="number" min="1" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Exterior Color</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })} required>
                                                    <option value="">Select Color</option>
                                                    {EXTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Interior Color</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })} required>
                                                    <option value="">Select Interior</option>
                                                    {INTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Specifications</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Transmission</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required>
                                                    <option value="">Select</option>
                                                    <option value="Automatic">Automatic</option>
                                                    <option value="Manual">Manual</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Fuel Type</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required>
                                                    <option value="">Select Fuel</option>
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Electric">Electric</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                    <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                                                    <option value="CNG">CNG</option>
                                                </select>
                                            </div>
                                            <Input label="Seating Capacity" type="number" min="1" max="60" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                                            <Input label="Range (e.g. 350km)" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                                            <Input label="Body Type (e.g. SUV)" value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} />
                                            <Input label="Mileage (e.g. 40 km)" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Registration & Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-1">
                                                <Input label="Number of Owners" type="number" min="0" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: Math.max(0, parseInt(e.target.value) || 0) })} disabled={formData.condition === 'New'} className={formData.condition === 'New' ? 'opacity-50' : ''} />
                                            </div>
                                            <Input label="Registration City" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                                            <Input label="Insurance Validity" type="date" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} required />
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Availability</label>
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                                    <option value="Available">Available</option>
                                                    <option value="Unavailable">Unavailable</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Description</label>
                                                <textarea className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all resize-y min-h-[120px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {currentStep === 4 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <h3 className="text-xl font-bold text-slate-900">Vehicle Media</h3>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Main Image Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">01</span>
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Main Profile Image</h4>
                                                </div>

                                                <div className="flex gap-4 items-center">
                                                    <input type="file" ref={mainFileRef} onChange={handleMainFileChange} className="hidden" accept="image/*" />
                                                    <Button type="button" variant="outline" onClick={() => mainFileRef.current.click()} disabled={mainLoading} className="h-12 border-dashed border-2 hover:border-blue-600 hover:text-blue-600 transition-all px-8 border-slate-200 uppercase text-[10px] font-black tracking-widest">
                                                        {mainLoading ? 'Uploading...' : 'Choose Main File'}
                                                    </Button>
                                                    {formData.image_url && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">✓</span> Ready</span>}
                                                </div>

                                                {formData.image_url && (
                                                    <div className="relative group max-w-md">
                                                        <img src={formData.image_url.startsWith('/') ? `${api.defaults.baseURL}${formData.image_url}` : formData.image_url} alt="Main Preview" className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                                        <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute top-3 right-3 h-8 w-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">×</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Secondary Gallery Section */}
                                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">02</span>
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Vehicle Gallery (Multi-Upload)</h4>
                                                </div>

                                                <div className="flex gap-4 items-center">
                                                    <input type="file" ref={multiFileRef} onChange={handleMultiFileChange} className="hidden" multiple accept="image/*" />
                                                    <Button type="button" variant="outline" onClick={() => multiFileRef.current.click()} disabled={multiLoading} className="h-12 border-dashed border-2 hover:border-slate-900 transition-all px-8 border-slate-200">
                                                        {multiLoading ? 'Processing Images...' : 'Add Gallery Photos'}
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                                    {formData.secondary_images.map((img, i) => (
                                                        <div key={i} className="relative group aspect-square">
                                                            <img src={img.startsWith('/') ? `${api.defaults.baseURL}${img}` : img} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-xl border border-slate-200" />
                                                            <button type="button" onClick={() => removeSecondaryImage(i)} className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-sm font-black">×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between shrink-0">
                                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1} className="h-11 px-8 font-bold border-slate-300">
                                    Previous
                                </Button>
                                <Button type="submit" variant={currentStep === steps.length ? 'primary' : 'slate'} className="h-11 px-8 font-bold shadow-sm">
                                    {currentStep === steps.length ? 'Save Vehicle to Fleet' : 'Next Step'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddCarPage;
