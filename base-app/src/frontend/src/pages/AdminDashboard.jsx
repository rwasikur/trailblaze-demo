import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else fetchCars(token);
    }, [navigate]);

    const fetchCars = async (token) => {
        try {
            const { data } = await api.get('/api/cars/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(data || []);
        } catch (err) {
            console.error('Failed to fetch cars:', err);
            setCars([]);
        }
    };


    return (
        <div className="min-h-full bg-slate-50 py-10 px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 id="dashboard-heading" className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-2 text-base">Manage your vehicle Catalogue and system operations.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => navigate('/admin/catalogue')} className="text-sm font-semibold h-11 border-slate-300">
                            Manage Catalogue
                        </Button>
                        <Button id="add-car-button" onClick={() => navigate('/admin/add-car')} className="text-sm font-semibold h-11" variant="slate">
                            + Add New Vehicle
                        </Button>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 m-0">All Vehicles</h2>
                        </div>

                        {cars.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-slate-500">No vehicles in Catalogue.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Vehicle</th>
                                            <th className="px-6 py-4 font-semibold">Year</th>
                                            <th className="px-6 py-4 font-semibold">Price</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="dashboard-car-list" className="divide-y divide-slate-100">
                                        {cars.map(car => (
                                            <tr id={`car-row-${car._id}`} key={car._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">{car.brand} {car.name}</td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{car.model_year}</td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">${car.price_per_day?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={car.availability_status === 'Available' ? 'available' : 'unavailable'}>
                                                        {car.availability_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end gap-3">
                                                    <Button id={`car-row-${car._id}-edit`} variant="outline" size="sm" onClick={() => navigate(`/admin/edit-car/${car._id}`)} className="h-8 px-3 text-xs">Edit</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
