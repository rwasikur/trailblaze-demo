import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

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
                    <Button variant="outline" onClick={() => navigate('/admin/inventory')} className="text-sm font-semibold h-11 border-slate-300">
                        Back to Inventory
                    </Button>
                </div>

                <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col min-h-0">
                    <CardContent className="p-0 flex flex-col h-full">
                        <form onSubmit={handleEditCar} className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <Input label="Car Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                    <Input label="Model Year" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                                    <Input label="Price ($)" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Transmission</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} required>
                                            <option value="">Select</option>
                                            <option value="Automatic">Automatic</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                    </div>
                                    <Input label="Fuel Type" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required />
                                    <Input label="Seating Capacity" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                                    <Input label="Range (e.g. 350km)" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                                    <Input label="Body Type (e.g. SUV)" value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} />
                                    <Input label="Mileage (e.g. 15,000 km)" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
                                    
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
                                    
                                    <Input label="Number of Owners" type="number" value={formData.number_of_owners} onChange={(e) => setFormData({ ...formData, number_of_owners: e.target.value })} />
                                    <Input label="Registration City" value={formData.registration_city} onChange={(e) => setFormData({ ...formData, registration_city: e.target.value })} />
                                    <Input label="Insurance Validity" value={formData.insurance_validity} onChange={(e) => setFormData({ ...formData, insurance_validity: e.target.value })} />
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">Availability</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 outline-none transition-all font-semibold" value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                            <option value="Available">Available</option>
                                            <option value="Pending">Pending</option>
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
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <Input label="Image URL" placeholder="https://example.com/car-image.jpg" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 shrink-0">
                                <Button type="submit" variant="slate" className="w-full h-12 font-bold shadow-sm text-base">
                                    Save Updates to Fleet
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
