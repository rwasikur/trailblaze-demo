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
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [editingBookingId, setEditingBookingId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else {
            fetchCars(token);
            fetchBookings(token);
        }
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

    const fetchBookings = async (token) => {
        try {
            const { data } = await api.get('/api/bookings/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(data || []);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setBookings([]);
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/bookings/admin/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Booking ${status.toLowerCase()}!`);
            // Simultaneous refresh to ensure UI is in sync
            await Promise.all([fetchBookings(token), fetchCars(token)]);
        } catch (err) {
            toast.error('Failed to update booking status');
            console.error(err);
        }
    };

    const getDisplayPrice = (car) => {
        const discount = parseInt(car?.discount_percentage) || 0;
        const hasDiscount = car && discount > 0 && discount < 100;
        return hasDiscount ? Math.round(car.price - (car.price * discount / 100)) : car?.price;
    };

    return (
        <div className="min-h-full bg-slate-50 py-10 px-4 md:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 id="dashboard-heading" className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">Manage your vehicle Catalogue and purchase bookings.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => navigate('/admin/catalogue')} className="text-xs font-bold h-10 border-slate-300">
                            Manage Catalogue
                        </Button>
                        <Button id="add-car-button" onClick={() => navigate('/admin/add-car')} className="text-xs font-bold h-10 shadow-lg shadow-slate-900/10" variant="slate">
                            + Add New Vehicle
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vehicles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Vehicles ({cars.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Bookings ({bookings.length})
                    </button>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {activeTab === 'vehicles' ? (
                            <>
                                <div className="bg-white px-6 py-5 border-b border-slate-100">
                                    <h2 className="text-base font-black uppercase tracking-widest text-slate-400">Inventory Overview</h2>
                                </div>

                                {cars.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No vehicles found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="text-[10px] text-slate-400 bg-slate-50/50 uppercase tracking-[0.2em] border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-black">Vehicle Details</th>
                                                    <th className="px-6 py-4 font-black">Model Year</th>
                                                    <th className="px-6 py-4 font-black">Price Point</th>
                                                    <th className="px-6 py-4 font-black">Status</th>
                                                    <th className="px-6 py-4 text-right font-black">Operations</th>
                                                </tr>
                                            </thead>
                                            <tbody id="dashboard-car-list" className="divide-y divide-slate-50">
                                                {cars.map(car => (
                                                    <tr id={`car-row-${car._id}`} key={car._id} className="hover:bg-slate-50/30 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">
                                                                {car.name.toLowerCase().startsWith(car.brand.toLowerCase()) ? car.name : `${car.brand} ${car.name}`}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{car.fuel_type} • {car.transmission}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-600 font-bold text-sm">{car.model_year}</td>
                                                        <td className="px-6 py-5 text-slate-900 font-black text-sm">₹{getDisplayPrice(car)?.toLocaleString()}</td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={car.availability_status === 'Available' ? 'available' : 'unavailable'}>
                                                                {car.availability_status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Button id={`car-row-${car._id}-edit`} variant="outline" size="sm" onClick={() => navigate(`/admin/edit-car/${car._id}`)} className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:border-slate-900 transition-all">Edit</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="bg-white px-6 py-5 border-b border-slate-100">
                                    <h2 className="text-base font-black uppercase tracking-widest text-slate-400">Incoming Requests</h2>
                                </div>

                                {bookings.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active bookings.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="text-[10px] text-slate-400 bg-slate-50/50 uppercase tracking-[0.2em] border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-black">Customer Profile</th>
                                                    <th className="px-6 py-4 font-black">Contact Info</th>
                                                    <th className="px-6 py-4 font-black">Vehicle Choice</th>
                                                    <th className="px-6 py-4 font-black">Timestamp</th>
                                                    <th className="px-6 py-4 font-black">Current Status</th>
                                                    <th className="px-6 py-4 text-right font-black">Action Panel</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {bookings.map(booking => (
                                                    <tr key={booking._id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">{booking.user_name}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{booking.user_email}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-600 font-bold text-sm tracking-tight">{booking.user_contact}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">
                                                                {booking.car?.name.toLowerCase().startsWith(booking.car?.brand.toLowerCase()) ? booking.car?.name : `${booking.car?.brand} ${booking.car?.name}`}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">₹{getDisplayPrice(booking.car)?.toLocaleString()}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-500 text-[11px] font-black uppercase tracking-tighter">
                                                            {new Date(booking.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={booking.status === 'Accepted' ? 'available' : booking.status === 'Pending' ? 'pending' : 'unavailable'}>
                                                                {booking.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {editingBookingId === booking._id ? (
                                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                                        <select
                                                                            className="h-8 px-2 text-[9px] font-black uppercase tracking-widest bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-slate-900 transition-all"
                                                                            value={booking.status}
                                                                            onChange={(e) => {
                                                                                handleBookingStatus(booking._id, e.target.value);
                                                                                setEditingBookingId(null);
                                                                            }}
                                                                        >
                                                                            <option value="Pending">Pending</option>
                                                                            <option value="Accepted">Accepted</option>
                                                                            <option value="Rejected">Rejected</option>
                                                                        </select>
                                                                        <button 
                                                                            onClick={() => setEditingBookingId(null)}
                                                                            className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-2"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {booking.status === 'Pending' ? (
                                                                            <div className="flex justify-end gap-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="slate"
                                                                                    className="h-8 px-4 text-[9px] bg-emerald-600 hover:bg-emerald-700 border-none font-black uppercase tracking-widest shadow-md shadow-emerald-600/10"
                                                                                    onClick={() => handleBookingStatus(booking._id, 'Accepted')}
                                                                                >
                                                                                    Accept
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-8 px-4 text-[9px] text-red-600 border-red-100 hover:bg-red-50 font-black uppercase tracking-widest"
                                                                                    onClick={() => handleBookingStatus(booking._id, 'Rejected')}
                                                                                >
                                                                                    Reject
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-8 px-4 text-[9px] font-black uppercase tracking-widest border-slate-200 hover:border-slate-900 transition-all"
                                                                                onClick={() => setEditingBookingId(booking._id)}
                                                                            >
                                                                                Edit Status
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
