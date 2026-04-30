import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

import { BRANDS_MODELS } from '../constants/carData';

const ManageCataloguePage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
        } else {
            fetchCars(token);
        }
    }, [navigate]);

    const fetchCars = async (token) => {
        setLoading(true);
        try {
            const carsRes = await api.get('/api/cars/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(carsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatusHandler = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/cars/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCars(token);
            toast.success('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Error updating car status.');
        }
    };

    return (
        <div className="min-h-full bg-slate-50 py-10 px-6 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Manage Catalogue</h1>
                        <p className="text-slate-500 mt-2 text-base">Overview and management of all registered vehicles.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="text-sm font-semibold h-11 border-slate-300">
                            Back to Dashboard
                        </Button>
                        <Button onClick={() => navigate('/admin/add-car')} className="text-sm font-semibold h-11" variant="slate">
                            <span>+</span> Add New Vehicle
                        </Button>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-visible bg-white">
                    <CardContent className="p-0 overflow-visible">
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">Car Name</th>
                                        <th className="px-6 py-4 font-semibold">Brand</th>
                                        <th className="px-6 py-4 font-semibold">Price</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400">Loading vehicles...</td>
                                        </tr>
                                    ) : cars.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-500 font-medium tracking-wide">
                                                No vehicles found in catalogue.
                                            </td>
                                        </tr>
                                    ) : (
                                        cars.map((car) => (
                                            <tr key={car._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">...{car._id.substring(car._id.length - 6)}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{car.name}</td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{car.brand}</td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">₹{car.price}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={car.availability_status === 'Available' ? 'available' : 'unavailable'}>
                                                        {car.availability_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <div className="relative inline-block text-left">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setActiveDropdown(activeDropdown === car._id ? null : car._id)}
                                                            className="h-8 text-xs font-semibold px-3"
                                                        >
                                                            Options ▼
                                                        </Button>
                                                        {activeDropdown === car._id && (
                                                            <>
                                                                <div onClick={() => setActiveDropdown(null)} className="fixed inset-0 z-40 bg-transparent"></div>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-1 divide-y divide-slate-100 font-medium text-sm text-left">
                                                                    <div className="py-1">
                                                                        <button onClick={() => { setActiveDropdown(null); navigate(`/admin/edit-car/${car._id}`); }} className="w-full text-left px-3 py-2 text-blue-600 hover:bg-slate-50 transition-colors rounded-md">✎ Edit Vehicle</button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ManageCataloguePage;
