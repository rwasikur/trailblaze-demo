import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PurchaseModal from './PurchaseModal';

const fuelIcon = (fuel) => {
    if (fuel === 'Electric') return 'EV';
    if (fuel === 'Diesel') return 'DS';
    if (fuel === 'Hybrid') return 'HY';
    return 'PT';
};

const fuelTheme = (fuel) => {
    if (fuel === 'Electric') return 'bg-cyan-500/90 text-white shadow-cyan-500/20';
    if (fuel === 'Diesel') return 'bg-emerald-500/90 text-white shadow-emerald-500/20';
    if (fuel === 'Hybrid') return 'bg-indigo-500/90 text-white shadow-indigo-500/20';
    return 'bg-amber-500/90 text-white shadow-amber-500/20'; // Petrol / Default
};

const CarCard = ({ car, featured = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const imageUrl = car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800';
    const isAvailable = !car.availability_status || car.availability_status === 'Available';
    const priceLabel = car.price_per_day ? `₹${car.price_per_day.toLocaleString()}` : 'Price on request';
    const summary = car.description
        ? car.description.replace(/<[^>]*>/g, '').slice(0, featured ? 220 : 120)
        : 'A premium Trailblazer listing with complete detail panels and image-led browsing.';

    const handleBuyClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    return (
        <>
            <Link to={`/car/${car._id}`} className="group block h-full rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent relative transition-all duration-500">
                {/* Hover Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-[1.8rem] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 pointer-events-none"></div>

                <article id={`car-card-${car._id}`} className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] ${featured ? 'lg:flex-row' : ''}`}>
                    <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'lg:w-[52%] aspect-[4/3] lg:aspect-auto' : 'aspect-[16/10]'}`}>
                        <img
                            src={imageUrl}
                            alt={`${car.brand} ${car.name}`}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>



                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md border border-white/20 ${fuelTheme(car.fuel_type)}`}>
                                <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                                {fuelIcon(car.fuel_type)} {car.fuel_type}
                            </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                            <div>
                                <div id={`car-card-${car._id}-brand`} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 mb-1">{car.brand}</div>
                                <div id={`car-card-${car._id}-name`} className="text-2xl font-black leading-tight tracking-tight drop-shadow-md">{car.name}</div>
                            </div>
                            {car.model_year && (
                                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-lg">
                                    {car.model_year}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`flex flex-1 flex-col p-5 md:p-6 ${featured ? 'lg:justify-between lg:p-10' : 'justify-between'}`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-100/50">
                                    {car.body_type || 'Curated'}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    {car.registration_city || 'HQ'}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 md:line-clamp-3">
                                {summary}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-6">
                            <div className="grid grid-cols-3 gap-2 pb-6 border-b border-slate-100">
                                <div className="text-center">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Drive</div>
                                    <div className="text-xs font-bold text-slate-900">{car.transmission?.slice(0, 4) || 'N/A'}</div>
                                </div>
                                <div className="text-center border-x border-slate-100">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Seats</div>
                                    <div className="text-xs font-bold text-slate-900">{car.seating_capacity || 'N/A'}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Miles</div>
                                    <div className="text-xs font-bold text-slate-900">{car.condition === 'New' ? '0km' : (car.mileage?.split(' ')[0] || 'N/A')}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Premium Listing</div>
                                    <div id={`car-card-${car._id}-price`} className="text-2xl font-black text-slate-900 tracking-tight">{priceLabel}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleBuyClick}
                                        className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95"
                                    >
                                        Buy Now
                                    </button>
                                    <div id={`car-card-${car._id}-view-details`} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 shadow-sm transition-all duration-300 hover:bg-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-110 active:scale-95">
                                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
            <PurchaseModal 
                car={car} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
};

export default CarCard;
