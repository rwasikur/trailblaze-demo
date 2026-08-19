import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { getColorCode } from '../constants/colorMapping';

const PurchaseModal = ({ car, isOpen, onClose, emiInfo }) => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_contact: '',
        selected_color: car.available_colors?.[0] || ''
    });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (car.available_colors?.[0]) {
            setFormData(prev => ({ ...prev, selected_color: car.available_colors[0] }));
        }
    }, [car]);

    const [loading, setLoading] = useState(false);

    const discount = parseInt(car?.discount_percentage) || 0;
    const hasDiscount = car && discount > 0 && discount < 100;
    const finalPrice = hasDiscount ? Math.round(car.price - (car.price * discount / 100)) : car?.price;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validation
        if (formData.user_name.trim().length < 2) {
            return toast.error('Please enter a valid full name (min 2 characters).');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.user_email)) {
            return toast.error('Please enter a valid email address.');
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData.user_contact)) {
            return toast.error('Please enter a valid phone number (min 10 digits).');
        }

        if (!formData.selected_color && car.available_colors && car.available_colors.length > 0) {
            return toast.error('Please select a color.');
        }

        // Build emi_details payload — only populated when coming from EMI calculator
        const emi_details = emiInfo
            ? {
                opted: true,
                tenure: emiInfo.tenure,
                downPaymentPct: emiInfo.downPaymentPct,
                monthlyEmi: emiInfo.emi,
                annualRate: emiInfo.annualRate
            }
            : null;

        setLoading(true);
        try {
            await api.post('/api/bookings', {
                car_id: car._id,
                ...formData,
                emi_details
            });
            toast.success('Booking request sent! Our team will contact you soon.');

            // Substantial delay to ensure toast is rendered and captured by automated tests
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error submitting booking:', error);
            toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 md:p-16 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500 cursor-pointer overflow-y-auto"
        >
            <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[85vh] my-auto overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 cursor-default flex flex-col md:flex-row relative">

                {/* Left Section: Visuals */}
                <div className="relative w-full md:w-5/12 h-48 md:h-auto bg-slate-900 overflow-hidden">
                    <img
                        src={car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800'}
                        className="w-full h-full object-cover opacity-80"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{car.brand}</h2>
                        <h3 className="text-xl font-bold text-white/60 tracking-tight leading-none">{car.name}</h3>

                        <div className="mt-6 flex gap-8">
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
                                <div className="text-xs font-black text-white">{car.condition === 'New' ? 'New' : 'Used'}</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Price</div>
                                <div className="text-xs font-black text-blue-400">${finalPrice?.toLocaleString()}</div>
                                {hasDiscount && (
                                    <div className="text-[8px] font-bold text-slate-500 line-through">${car.price?.toLocaleString()}</div>
                                )}
                            </div>
                            {hasDiscount && (
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1">Offer</div>
                                    <div className="text-xs font-black text-red-500">{discount}% OFF</div>
                                </div>
                            )}
                        </div>

                        {/* EMI Summary Strip — shown only when coming from EMI calculator */}
                        {emiInfo && (
                            <div className="mt-4 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Selected EMI Plan</div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-black text-blue-400">
                                        ${emiInfo.emi.toLocaleString('en-US')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">/month</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    {emiInfo.tenure} months · {emiInfo.downPaymentPct}% down payment
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Form */}
                <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col relative overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm z-10"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking</h2>
                        <p className="text-slate-400 font-medium text-[10px] mt-0.5">
                            {emiInfo
                                ? `EMI plan · $${emiInfo.emi.toLocaleString('en-US')}/mo for ${emiInfo.tenure} months`
                                : 'Reserve this vehicle.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                        <div className="grid gap-3">
                            <div className="space-y-1">
                                <label htmlFor="purchase-name" className="block text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                <input
                                    id="purchase-name"
                                    required
                                    type="text"
                                    value={formData.user_name}
                                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="purchase-email" className="block text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                <input
                                    id="purchase-email"
                                    required
                                    type="email"
                                    value={formData.user_email}
                                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="purchase-contact" className="block text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact</label>
                                <input
                                    id="purchase-contact"
                                    required
                                    type="tel"
                                    value={formData.user_contact}
                                    onChange={(e) => setFormData({ ...formData, user_contact: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                                    placeholder="Phone Number"
                                />
                            </div>
                            {(car.available_colors && car.available_colors.length > 0) && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Preferred Color</label>
                                    <div className="flex flex-wrap gap-3 pt-1">
                                        {(car.available_colors || []).map((color, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, selected_color: color })}
                                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${formData.selected_color === color
                                                        ? 'bg-slate-950 text-white border-slate-950 shadow-lg scale-105'
                                                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                                                    style={{ backgroundColor: getColorCode(color) }}
                                                ></span>
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                id="purchase-submit"
                                disabled={loading}
                                type="submit"
                                className="w-full py-3.5 bg-slate-950 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-xl"
                            >
                                {loading ? 'Processing...' : 'Book Now'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;