import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { getColorCode } from '../constants/colorMapping';

// Small inline component for the EMI / Full Payment badge in the bookings table
const FinancingBadge = ({ emiDetails }) => {
    if (emiDetails && emiDetails.opted) {
        return (
            <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-black uppercase tracking-widest">
                    <span>$</span> EMI
                </span>
                <div className="text-[10px] font-bold text-slate-700">
                    ${emiDetails.monthlyEmi?.toLocaleString('en-US')}<span className="text-slate-400">/mo</span>
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                    {emiDetails.tenure} mo · {emiDetails.downPaymentPct}% down · {emiDetails.annualRate}% p.a.
                </div>
            </div>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest">
            Full Payment
        </span>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [offers, setOffers] = useState([]);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [editingBookingId, setEditingBookingId] = useState(null);
    const carPage = parseInt(searchParams.get('vPage') || '1');
    const bookingPage = parseInt(searchParams.get('bPage') || '1');
    const ITEMS_PER_PAGE = 10;
    const [bookingFilter, setBookingFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) navigate('/admin');
        else {
            fetchCars(token);
            fetchBookings(token);
            fetchOffers(token);
        }

        fetchCars(token);
        fetchBookings(token);
    }, [navigate]);

    const fetchCars = async (token) => {
        try {
            let res;
            try {
                res = await api.get('/api/cars/admin/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) {
                res = await api.get('/api/cars');
            }
            const carsList = Array.isArray(res.data) ? res.data : (res.data?.cars || []);
            setCars(carsList);
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

    const fetchOffers = async (token) => {
        try {
            const { data } = await api.get('/api/offers/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOffers(data || []);
        } catch (err) {
            console.error('Failed to fetch offers:', err);
            setOffers([]);
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/api/bookings/admin/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Booking ${status.toLowerCase()}!`);

            if (status === 'Accepted') {
                navigate('/admin/sales-history', { state: { lastAcceptedId: bookingId } });
                return;
            }

            // Simultaneous refresh to ensure UI is in sync
            await Promise.all([fetchBookings(token), fetchCars(token), fetchOffers(token)]);
        } catch (err) {
            toast.error('Failed to update booking status');
            console.error(err);
        }
    };

    const paginatedCars = useMemo(() => {
        const startIndex = (carPage - 1) * ITEMS_PER_PAGE;
        return cars.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [cars, carPage]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter);
    }, [bookings, bookingFilter]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (bookingPage - 1) * ITEMS_PER_PAGE;
        return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBookings, bookingPage]);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 id="dashboard-heading" className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 mt-2 text-base">
                            Manage your vehicle Catalogue, purchase bookings, and system operations.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button id="sales-history-link" variant="outline" onClick={() => navigate('/admin/sales-history')} className="text-xs font-bold h-10 border-slate-300">
                            Sales History
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/admin/catalogue')} className="text-xs font-bold h-10 border-slate-300">
                            Manage Catalogue
                        </Button>
                        <Button
                            id="add-car-button"
                            onClick={() => navigate('/admin/add-car')}
                            className="text-sm font-semibold h-11"
                            variant="slate"
                        >
                            + Add New Vehicle
                        </Button>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                        <button
                            id="admin-vehicles-tab"
                            onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vehicles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Vehicles ({cars.length})
                        </button>
                        <button
                            id="admin-bookings-tab"
                            onClick={() => { setActiveTab('bookings'); setSearchTerm(''); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Bookings ({bookings.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            id="admin-search-input"
                            type="text"
                            placeholder={activeTab === 'vehicles' ? "Search by Name, Brand or Fuel Type..." : "Search by Customer Name or Email..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm shadow-slate-900/5"
                        />
                    </div>
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
                                                {paginatedCars.map(car => (
                                                    <tr id={`car-row-${car._id}`} key={car._id} className="hover:bg-slate-50/30 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">
                                                                {car.name?.toLowerCase().startsWith(car.brand?.toLowerCase()) ? car.name : `${car.brand} ${car.name}`}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{car.fuel_type} • {car.transmission}</div>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <Badge variant={car.condition === 'New' ? 'new' : 'used'} className="text-[8px] px-1.5 py-0 h-4">
                                                                    {car.condition === 'New' ? 'New' : 'Pre-Owned'}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-600 font-bold text-sm">{car.model_year}</td>
                                                        <td className="px-6 py-5 text-slate-900 font-black text-sm">${getDisplayPrice(car)?.toLocaleString()}</td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={car.availability_status === 'Available' ? 'available' : 'unavailable'} className="w-fit">
                                                                {car.availability_status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            {car.availability_status === 'Available' ? (
                                                                <Button 
                                                                    id={`car-row-${car._id}-edit`} 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => navigate(`/admin/edit-car/${car._id}?fromPage=${carPage}&from=dashboard`)} 
                                                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:border-slate-900 transition-all"
                                                                >
                                                                    Edit
                                                                </Button>
                                                            ) : car.condition === 'New' ? (
                                                                <Button
                                                                    id={`car-row-${car._id}-copy`}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => navigate('/admin/add-car', { state: { copyFrom: car } })}
                                                                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:border-slate-900 transition-all"
                                                                >
                                                                    Make a Copy
                                                                </Button>
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="p-4 border-t border-slate-100">
                                            <Pagination
                                                totalItems={cars.length}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                currentPage={carPage}
                                                onPageChange={(page) => setSearchParams(prev => {
                                                    const newParams = new URLSearchParams(prev);
                                                    newParams.set('vPage', page.toString());
                                                    return newParams;
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : activeTab === 'bookings' ? (
                            <>
                                <div className="bg-white px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-base font-black uppercase tracking-widest text-slate-400">Incoming Requests</h2>
                                    <div className="flex gap-2">
                                        {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                                            <div
                                                key={status}
                                                onClick={() => setBookingFilter(status)}
                                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${bookingFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {status}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {bookings.filter(b => bookingFilter === 'All' || b.status === bookingFilter).length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No {bookingFilter.toLowerCase()} bookings found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="text-[10px] text-slate-400 bg-slate-50/50 uppercase tracking-[0.2em] border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-black">Customer Name</th>
                                                    <th className="px-6 py-4 font-black">Contact Info</th>
                                                    <th className="px-6 py-4 font-black">Vehicle Choice</th>
                                                    <th className="px-6 py-4 font-black">Financing</th>
                                                    <th className="px-6 py-4 font-black">Timestamp</th>
                                                    <th className="px-6 py-4 font-black">Current Status</th>
                                                    <th className="px-6 py-4 text-right font-black">Action Panel</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {paginatedBookings.map(booking => (
                                                    <tr id={`booking-row-${booking._id}`} key={booking._id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">{booking.user_name}</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-slate-600 font-bold text-sm tracking-tight">{booking.user_email}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{booking.user_contact}</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="font-black text-slate-900 text-sm">
                                                                {booking.car?.name?.toLowerCase().startsWith(booking.car?.brand?.toLowerCase()) ? booking.car?.name : `${booking.car?.brand} ${booking.car?.name}`}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <div className="font-bold text-blue-600 text-[10px] uppercase tracking-widest">${getDisplayPrice(booking.car)?.toLocaleString()}</div>
                                                                {booking.car?.condition === 'New' && (
                                                                    <>
                                                                        <span className="text-slate-300 text-[10px]">•</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <div 
                                                                                className="w-2 h-2 rounded-full border border-slate-200" 
                                                                                style={{ backgroundColor: getColorCode(booking.selected_color) }}
                                                                            />
                                                                            <div className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">{booking.selected_color || 'N/A'}</div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <Badge variant={booking.car?.condition === 'New' ? 'new' : 'used'} className="text-[8px] px-1.5 py-0 h-4">
                                                                    {booking.car?.condition === 'New' ? 'New' : 'Pre-Owned'}
                                                                </Badge>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <FinancingBadge emiDetails={booking.emi_details} />
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                                                            {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={booking.status === 'Accepted' ? 'available' : booking.status === 'Rejected' ? 'unavailable' : 'pending'}>
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
                                                                                        id={`booking-row-${booking._id}-accept`}
                                                                                        size="sm"
                                                                                        variant="slate"
                                                                                        className="h-8 px-4 text-[9px] bg-emerald-600 hover:bg-emerald-700 border-none font-black uppercase tracking-widest shadow-md shadow-emerald-600/10"
                                                                                        onClick={() => handleBookingStatus(booking._id, 'Accepted')}
                                                                                    >
                                                                                        Accept
                                                                                    </Button>
                                                                                    <Button
                                                                                        id={`booking-row-${booking._id}-reject`}
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
                                                                                    id={`booking-row-${booking._id}-edit-status`}
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
                                        <div className="p-4 border-t border-slate-100">
                                            <Pagination
                                                totalItems={filteredBookings.length}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                currentPage={bookingPage}
                                                onPageChange={(page) => setSearchParams(prev => {
                                                    const newParams = new URLSearchParams(prev);
                                                    newParams.set('bPage', page.toString());
                                                    return newParams;
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

