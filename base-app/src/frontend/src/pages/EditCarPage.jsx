import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { BRANDS_MODELS } from '../constants/carData';

const EditCarPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '',
        price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '',
        number_of_owners: 0, registration_city: '', insurance_validity: '', description: '',
        availability_status: 'Available', image_url: '', condition: 'Used'
    });
    const [loading, setLoading] = useState(true);
    const [mainLoading, setMainLoading] = useState(false);
    const [multiLoading, setMultiLoading] = useState(false);
    const mainFileRef = useRef(null);
    const multiFileRef = useRef(null);

    const brands = Object.keys(BRANDS_MODELS).sort();
    const models = formData.brand && BRANDS_MODELS[formData.brand] ? BRANDS_MODELS[formData.brand] : [];

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
                    registration_city: data.registration_city || '',
                    insurance_validity: data.insurance_validity || '',
                    description: data.description || '',
                    secondary_images: data.secondary_images || [],
                    availability_status: data.availability_status || 'Available',
                    image_url: data.image_url || '',
                    condition: data.condition || 'Used',
                    number_of_owners: data.number_of_owners !== undefined && data.number_of_owners !== null ? data.number_of_owners : 0
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
                secondary_images: [...(prev.secondary_images || []), ...res.data.urls]
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

    const handleEditCar = async (e) => {
        e.preventDefault();

        // VALIDATIONS (Matching AddCarPage)
        const price = parseInt(formData.price_per_day);
        if (isNaN(price) || price < 100) {
            toast.error('Price must be at least $100');
            return;
        }
        if (price > 10000000) {
            toast.error('Price exceeds maximum allowed limit ($10,000,000)');
            return;
        }

        const year = parseInt(formData.model_year);
        if (year < 1886 || year > new Date().getFullYear() + 1) {
            toast.error('Please enter a valid model year');
            return;
        }

        if (parseInt(formData.seating_capacity) <= 0 || parseInt(formData.seating_capacity) > 60) {
            toast.error('Seating capacity must be between 1 and 60');
            return;
        }

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

        if (formData.condition === 'New') {
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(today.getFullYear() + 1);
            oneYearFromNow.setHours(0, 0, 0, 0);
            if (validityDate < oneYearFromNow) {
                toast.error('New vehicles must have at least 1 year of valid insurance');
                return;
            }
        }

        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/api/cars/${id}`, formData, config);
            toast.success('Vehicle updated successfully!');
            navigate('/admin/catalogue');
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="min-h-full flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 font-medium">Loading details...</p>
        </div>
    );

    return (
        <div className="min-h-full bg-slate-50 py-10 px-6 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto space-y-8 flex flex-col h-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Edit Vehicle</h1>
                        <p className="text-slate-500 mt-2 text-base">Update vehicle metadata and availability status below.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/admin/catalogue')} className="text-sm font-semibold h-11 border-slate-300">
                        Back to Catalogue
                    </Button>
                </div>

                <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col min-h-0">
                    <CardContent className="p-0 flex flex-col h-full">
                        <form onSubmit={handleEditCar} className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        <label className="block text-sm font-bold text-slate-700">Vehicle Condition</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                                            value={formData.condition}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    condition: val,
                                                    number_of_owners: val === 'New' ? 0 : formData.number_of_owners
                                                });
                                            }}
                                            required
                                        >
                                            <option value="New">Brand New</option>
                                            <option value="Used">Pre-Owned</option>
                                        </select>
                                    </div>
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
                                    <Input label="Mileage (e.g. 40km)" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Exterior Color</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.exterior_color} onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}>
                                            <option value="">Select</option>
                                            <option value="Black">Black</option>
                                            <option value="White">White</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Grey">Grey</option>
                                            <option value="Blue">Blue</option>
                                            <option value="Red">Red</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Interior Color</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.interior_color} onChange={(e) => setFormData({ ...formData, interior_color: e.target.value })}>
                                            <option value="">Select</option>
                                            <option value="Black">Black</option>
                                            <option value="White">White</option>
                                            <option value="Beige">Beige</option>
                                            <option value="Brown">Brown</option>
                                            <option value="Grey">Grey</option>
                                        </select>
                                    </div>

                                    <Input
                                        label="Number of Owners"
                                        type="number"
                                        value={formData.number_of_owners === "" ? 0 : formData.number_of_owners}
                                        onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value === "" ? 0 : e.target.value })}
                                        disabled={formData.condition === 'New'}
                                        className={formData.condition === 'New' ? 'opacity-50 grayscale bg-slate-100 cursor-not-allowed' : ''}
                                    />
                                    <Input label="Registration City" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                                    <Input label="Insurance Validity" type="date" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} required />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Availability</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 outline-none transition-all font-semibold" value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                            <option value="Available">Available</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all resize-y"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-slate-100 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">01</span>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Main Profile Image</h4>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <input type="file" ref={mainFileRef} onChange={handleMainFileChange} className="hidden" accept="image/*" />
                                                <Button type="button" variant="outline" onClick={() => mainFileRef.current.click()} disabled={mainLoading} className="h-12 border-dashed border-2 hover:border-blue-600 hover:text-blue-600 transition-all px-8 border-slate-200 uppercase text-[10px] font-black tracking-widest">
                                                    {mainLoading ? 'Uploading...' : 'Update Main File'}
                                                </Button>
                                                {formData.image_url && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">✓</span> Current Image Valid</span>}
                                            </div>

                                            {formData.image_url && (
                                                <div className="relative group max-w-md mt-4">
                                                    <img src={formData.image_url.startsWith('/') ? `${api.defaults.baseURL}${formData.image_url}` : formData.image_url} alt="Main Preview" className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                                    <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute top-3 right-3 h-8 w-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 font-bold">×</button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">02</span>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Vehicle Gallery</h4>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <input type="file" ref={multiFileRef} onChange={handleMultiFileChange} className="hidden" multiple accept="image/*" />
                                                <Button type="button" variant="outline" onClick={() => multiFileRef.current.click()} disabled={multiLoading} className="h-12 border-dashed border-2 hover:border-slate-900 transition-all px-8 border-slate-200 uppercase text-[10px] font-black tracking-widest">
                                                    {multiLoading ? 'Processing...' : 'Add Gallery Photos'}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                                {(formData.secondary_images || []).map((img, i) => (
                                                    <div key={i} className="relative group aspect-square">
                                                        <img src={img.startsWith('/') ? `${api.defaults.baseURL}${img}` : img} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                        <button type="button" onClick={() => removeSecondaryImage(i)} className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-sm font-black shadow-md">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 shrink-0">
                                <Button type="submit" variant="slate" className="w-full h-12 font-bold shadow-sm text-base">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditCarPage;
