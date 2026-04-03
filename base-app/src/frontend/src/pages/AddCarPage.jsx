import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const AddCarPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', brand: '', model_year: '', transmission: '', fuel_type: '', seating_capacity: '',
        price_per_day: '', range: '', body_type: '', mileage: '', exterior_color: '', interior_color: '',
        number_of_owners: '', registration_city: '', insurance_validity: '', description: '',
        availability_status: 'Available', image_url: ''
    });
    const [currentStep, setCurrentStep] = useState(1);

    const steps = ['Basic Info', 'Specifications', 'Registration & Details', 'Media'];

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
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Car Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                            <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                                            <Input label="Model Year" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.model_year} onChange={(e) => setFormData({ ...formData, model_year: e.target.value })} required />
                                            <Input label="Price ($)" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} required />
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
                                            <Input label="Fuel Type" value={formData.fuel_type} onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })} required />
                                            <Input label="Seating Capacity" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.seating_capacity} onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })} required />
                                            <Input label="Range (e.g. 350km)" value={formData.range} onChange={(e) => setFormData({ ...formData, range: e.target.value })} />
                                            <Input label="Body Type (e.g. SUV)" value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} />
                                            <Input label="Mileage (e.g. 15,000 km)" value={formData.mileage} onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Registration & Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all" value={formData.availability_status} onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}>
                                                    <option value="Available">Available</option>
                                                    <option value="Unavailable">Unavailable</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="block text-sm font-bold text-slate-700">Description</label>
                                                <textarea 
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all resize-y min-h-[120px]" 
                                                    value={formData.description} 
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Vehicle Media</h3>
                                        <div className="space-y-6">
                                            <Input 
                                                label="Image URL" 
                                                placeholder="https://example.com/car-image.jpg"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                            {formData.image_url && (
                                                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-w-sm">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover" onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            )}
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
