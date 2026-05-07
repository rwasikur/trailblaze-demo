import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import Select from 'react-select';

import { BRANDS_MODELS, CAR_COLORS } from '../constants/carData';

const AddCarPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mainFileRef = useRef(null);
    const multiFileRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '',
        price: '', range: '', body_type: '', mileage: '', total_distance_covered: '', available_colors: [''],
        number_of_owners: 0, registration_city: '', insurance_validity: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], description: '',
        availability_status: 'Available', image_url: '', secondary_images: [], condition: 'New', past_owners: [], discount_percentage: 0
    });

    const [colorCount, setColorCount] = useState(1);
    const [isCopy, setIsCopy] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
    }, [navigate]);

    useEffect(() => {
        if (location.state && location.state.copyFrom) {
            const car = location.state.copyFrom;
            setIsCopy(true);
            setFormData({
                name: car.name || '',
                brand: car.brand || '',
                model_year: car.model_year?.toString() || '',
                transmission: car.transmission || '',
                fuel_type: car.fuel_type || '',
                seating_capacity: car.seating_capacity || '',
                price: car.price || '',
                range: car.range || '',
                body_type: car.body_type || '',
                mileage: car.mileage || '',
                total_distance_covered: car.total_distance_covered || '',
                available_colors: car.available_colors || [''],
                number_of_owners: car.number_of_owners || 0,
                registration_city: car.registration_city || '',
                insurance_validity: car.insurance_validity ? new Date(car.insurance_validity).toISOString().split('T')[0] : '',
                description: car.description || '',
                availability_status: 'Available', // Force Available on copy
                image_url: car.image_url || '',
                secondary_images: car.secondary_images || [],
                condition: car.condition || 'New',
                past_owners: car.past_owners || []
            });
            if (car.available_colors) {
                setColorCount(car.available_colors.length);
            }
        }
    }, [location.state]);

    const [uploadMethod] = useState('local'); // Locked to 'local' upload
    const [mainLoading, setMainLoading] = useState(false);
    const [multiLoading, setMultiLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = ['Basic Info', 'Specifications', 'Registration & Details', 'Media'];

    const brands = Object.keys(BRANDS_MODELS).sort();
    const models = formData.brand ? BRANDS_MODELS[formData.brand] : [];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => {
        const year = (currentYear - i).toString();
        return { value: year, label: year };
    });

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

    const handleOwnerCountChange = (e) => {
        const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
        const targetLength = val === '' ? 0 : val;
        let updatedPastOwners = [...(formData.past_owners || [])];

        if (targetLength > updatedPastOwners.length) {
            const diff = targetLength - updatedPastOwners.length;
            for (let i = 0; i < diff; i++) {
                updatedPastOwners.push({ sale_date: '', sale_price: '', seller_name: '', buyer_name: '' });
            }
        } else if (targetLength < updatedPastOwners.length) {
            updatedPastOwners = updatedPastOwners.slice(0, targetLength);
        }

        setFormData({ ...formData, number_of_owners: val, past_owners: updatedPastOwners });
    };

    const handlePastOwnerChange = (index, field, value) => {
        const newPastOwners = [...(formData.past_owners || [])];
        newPastOwners[index] = { ...newPastOwners[index], [field]: value };
        setFormData({ ...formData, past_owners: newPastOwners });
    };

    const handleColorCountChange = (e) => {
        const count = Math.max(1, parseInt(e.target.value) || 1);
        setColorCount(count);
        const newColors = [...formData.available_colors];
        if (count > newColors.length) {
            for (let i = newColors.length; i < count; i++) newColors.push('');
        } else {
            newColors.length = count;
        }
        setFormData({ ...formData, available_colors: newColors });
    };

    const handleColorChange = (index, value) => {
        const newColors = [...formData.available_colors];
        newColors[index] = value;
        setFormData({ ...formData, available_colors: newColors });
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();

        // Step 1 Validation
        if (currentStep === 1) {
            if (!formData.brand || !formData.name || !formData.model_year) {
                toast.error('Please fill in all basic information');
                return;
            }
            if (formData.condition === 'New' && (!formData.available_colors || formData.available_colors.some(c => !c))) {
                toast.error('Please select all available colors');
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
            const price = parseInt(formData.price);
            if (isNaN(price) || price < 100) {
                toast.error('Price must be at least $100');
                return;
            }
            if (price > 10000000) { // $10M max for ultra-luxury
                toast.error('Price exceeds maximum allowed limit ($10,000,000)');
                return;
            }
            const numOwners = parseInt(formData.number_of_owners);
            if (formData.condition === 'Used' && (isNaN(numOwners) || numOwners <= 0)) {
                toast.error('Pre-owned vehicles must have at least 1 previous owner');
                return;
            }
            if (formData.condition === 'Used' && formData.past_owners && formData.past_owners.length > 0) {
                const lastOwner = formData.past_owners[formData.past_owners.length - 1];
                const lastPrice = parseInt(lastOwner.sale_price);
                if (!isNaN(lastPrice) && parseInt(formData.price) >= lastPrice) {
                    toast.error(`Price must be less than the last sale price ($${lastPrice.toLocaleString()})`);
                    return;
                }
            }
            if (formData.condition === 'Used') {
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

        // Image Validation
        if (!formData.image_url) {
            toast.error('A main profile image is required for every vehicle entry.');
            return;
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
        <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto space-y-8 flex flex-col">
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

                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-0">
                        <form onSubmit={handleAddCar} noValidate>
                            <div className="p-6 md:p-8 pb-10 space-y-6">
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700">Vehicle Condition<span className="text-red-500 ml-1">*</span></label>
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
                                                        number_of_owners: isNew ? 0 : (formData.number_of_owners === 0 ? '' : formData.number_of_owners),
                                                        past_owners: isNew ? [] : (formData.past_owners || []),
                                                        insurance_validity: insuranceVal
                                                    });
                                                }} required>
                                                    <option value="New">Brand New (Showroom)</option>
                                                    <option value="Used">Pre-Owned (Secondary Market)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Brand<span className="text-red-500 ml-1">*</span></label>
                                                <Select
                                                    inputId="brand-select"
                                                    options={brands.map(b => ({ value: b, label: b }))}
                                                    value={formData.brand ? { value: formData.brand, label: formData.brand } : null}
                                                    onChange={(selected) => setFormData({ ...formData, brand: selected ? selected.value : '', name: '' })}
                                                    placeholder="Select Brand"
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: '48px',
                                                            backgroundColor: state.isFocused ? 'white' : '#f8fafc',
                                                            borderColor: state.isFocused ? '#0f172a' : '#e2e8f0',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(15, 23, 42, 0.1)' : 'none',
                                                            '&:hover': { borderColor: state.isFocused ? '#0f172a' : '#cbd5e1' }
                                                        }),
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        menu: (base) => ({ ...base, zIndex: 50 }),
                                                        option: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'white',
                                                            color: state.isSelected ? 'white' : '#0f172a',
                                                            cursor: 'pointer',
                                                            '&:active': { backgroundColor: '#3b82f6', color: 'white' }
                                                        }),
                                                        singleValue: (base) => ({ ...base, color: '#0f172a' })
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Car Name<span className="text-red-500 ml-1">*</span></label>
                                                <Select
                                                    inputId="model-select"
                                                    options={models.map(m => ({ value: m, label: m }))}
                                                    value={formData.name ? { value: formData.name, label: formData.name } : null}
                                                    onChange={(selected) => setFormData({ ...formData, name: selected ? selected.value : '' })}
                                                    placeholder="Select Model"
                                                    isSearchable
                                                    isDisabled={!formData.brand}
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: '48px',
                                                            backgroundColor: state.isFocused ? 'white' : '#f8fafc',
                                                            borderColor: state.isFocused ? '#0f172a' : '#e2e8f0',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(15, 23, 42, 0.1)' : 'none',
                                                            '&:hover': { borderColor: state.isFocused ? '#0f172a' : '#cbd5e1' }
                                                        }),
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        menu: (base) => ({ ...base, zIndex: 50 }),
                                                        option: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'white',
                                                            color: state.isSelected ? 'white' : '#0f172a',
                                                            cursor: 'pointer',
                                                            '&:active': { backgroundColor: '#3b82f6', color: 'white' }
                                                        }),
                                                        singleValue: (base) => ({ ...base, color: '#0f172a' })
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Model Year<span className="text-red-500 ml-1">*</span></label>
                                                <Select
                                                    inputId="year-select"
                                                    options={yearOptions}
                                                    value={formData.model_year ? { value: formData.model_year, label: formData.model_year } : null}
                                                    onChange={(selected) => setFormData({ ...formData, model_year: selected ? selected.value : '' })}
                                                    placeholder="Select Year"
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: '48px',
                                                            backgroundColor: state.isFocused ? 'white' : '#f8fafc',
                                                            borderColor: state.isFocused ? '#0f172a' : '#e2e8f0',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(15, 23, 42, 0.1)' : 'none',
                                                            '&:hover': { borderColor: state.isFocused ? '#0f172a' : '#cbd5e1' }
                                                        }),
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        menu: (base) => ({ ...base, zIndex: 50 }),
                                                        option: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'white',
                                                            color: state.isSelected ? 'white' : '#0f172a',
                                                            cursor: 'pointer',
                                                            '&:active': { backgroundColor: '#3b82f6', color: 'white' }
                                                        }),
                                                        singleValue: (base) => ({ ...base, color: '#0f172a' })
                                                    }}
                                                />
                                            </div>

                                            {/* Color Selection Block */}
                                            <div className="md:col-span-2 space-y-6">
                                                {formData.condition === 'New' && (
                                                    <div className="space-y-2 max-w-xs">
                                                        <label htmlFor="color-count-input" className="block text-sm font-bold text-slate-700">How many colors available?<span className="text-red-500 ml-1">*</span></label>
                                                        <input
                                                            id="color-count-input"
                                                            type="number"
                                                            min="1"
                                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                                            value={colorCount}
                                                            onChange={handleColorCountChange}
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {formData.available_colors.map((color, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <label htmlFor={`color-select-${idx}`} className="block text-sm font-bold text-slate-700">
                                                                Color Option {idx + 1}
                                                                {idx === 0 && <span className="text-[10px] text-blue-600 ml-2">(Primary Exterior)</span>}
                                                            </label>
                                                            <select
                                                                id={`color-select-${idx}`}
                                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                                                                value={color}
                                                                onChange={(e) => handleColorChange(idx, e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Color</option>
                                                                {CAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Specifications</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="transmission-select" className="block text-sm font-bold text-slate-700">Transmission<span className="text-red-500 ml-1">*</span></label>
                                                <select id="transmission-select" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required>
                                                    <option value="">Select</option>
                                                    <option value="Automatic">Automatic</option>
                                                    <option value="Manual">Manual</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="fuel-type-select" className="block text-sm font-bold text-slate-700">Fuel Type<span className="text-red-500 ml-1">*</span></label>
                                                <select id="fuel-type-select" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required>
                                                    <option value="">Select Fuel</option>
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Electric">Electric</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                    <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                                                    <option value="CNG">CNG</option>
                                                </select>
                                            </div>
                                            <Input id="seating-capacity-input" label="Seating Capacity" type="number" min="1" max="10" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                                            <Input id="range-input" label="Range (e.g. 350km)" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                                            <Input id="body-type-input" label="Body Type (e.g. SUV)" value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} />
                                            <Input id="mileage-input" label="Mileage (kmpl)" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} placeholder="e.g. 18.5" />
                                            {formData.condition === 'Used' && (
                                                <Input id="distance-input" label="Total Distance Covered" value={formData.total_distance_covered} onChange={(e) => setFormData({ ...formData, total_distance_covered: e.target.value })} placeholder="e.g. 45,000 km" />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Registration & Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-1">
                                                <Input id="owners-count-input" label="Number of Owners" type="number" min="0" value={formData.number_of_owners} onChange={handleOwnerCountChange} disabled={formData.condition === 'New'} className={formData.condition === 'New' ? 'opacity-50' : ''} required={formData.condition === 'Used'} />
                                            </div>
                                            <Input id="car-price-input" label="Price ($)" type="number" min="1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                            <Input id="car-discount-input" label="Discount (%)" type="number" min="0" max="100" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })} />
                                            {formData.condition === 'Used' && (
                                                <>
                                                    <Input id="registration-city-input" label="Registration City" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                                                    <Input id="insurance-validity-input" label="Insurance Validity" type="date" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} required />
                                                </>
                                            )}
                                            {formData.past_owners && formData.past_owners.length > 0 && (
                                                <div className="md:col-span-3 space-y-4 border-t border-slate-100 pt-4 mt-2">
                                                    <h4 className="text-sm font-bold text-slate-900">Past Owner History</h4>
                                                    {formData.past_owners.map((owner, index) => (
                                                        <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 p-4 relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl">OWNER {index + 1}</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                                <Input id={`sale-date-${index}`} label="Sale Date" type="date" value={owner.sale_date || ''} onChange={(e) => handlePastOwnerChange(index, 'sale_date', e.target.value)} required />
                                                                <Input id={`sale-price-${index}`} label="Sale Price ($)" type="number" min="0" value={owner.sale_price || ''} onChange={(e) => handlePastOwnerChange(index, 'sale_price', e.target.value)} required />
                                                                <Input id={`seller-name-${index}`} label="Seller Name" value={owner.seller_name || ''} onChange={(e) => handlePastOwnerChange(index, 'seller_name', e.target.value)} required />
                                                                <Input id={`buyer-name-${index}`} label="Buyer Name" value={owner.buyer_name || ''} onChange={(e) => handlePastOwnerChange(index, 'buyer_name', e.target.value)} required />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Description</label>
                                                <textarea className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all resize-y min-h-[120px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
                                            </div>

                                            <div className="md:col-span-3 space-y-2">
                                                <label htmlFor="availability-status-select" className="block text-sm font-bold text-slate-700">Availability Status</label>
                                                <select 
                                                    id="availability-status-select"
                                                    className={`w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 outline-none transition-all ${isCopy ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900'}`} 
                                                    value={formData.availability_status} 
                                                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                                                    disabled={isCopy}
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Sold">Sold</option>
                                                </select>
                                                {isCopy && <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Status locked to Available for duplicate entries</p>}
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
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Main Profile Image<span className="text-red-500 ml-1">*</span></h4>
                                                </div>

                                                <div className="flex gap-4 items-center">
                                                    <input id="main-image-input" type="file" ref={mainFileRef} onChange={handleMainFileChange} className="hidden" accept="image/*" />
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
                                                    <input id="secondary-images-input" type="file" ref={multiFileRef} onChange={handleMultiFileChange} className="hidden" multiple accept="image/*" />
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
