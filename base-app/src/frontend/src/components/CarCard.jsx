import React from 'react';
import { Link } from 'react-router-dom';

const fuelIcon = (fuel) => {
    if (fuel === 'Electric') return 'EV';
    if (fuel === 'Diesel') return 'DS';
    if (fuel === 'Hybrid') return 'HY';
    return 'PT';
};

const CarCard = ({ car, featured = false }) => {
    const imageUrl = car.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800';
    const isAvailable = !car.availability_status || car.availability_status === 'Available';
    const priceLabel = car.price_per_day ? `$${car.price_per_day.toLocaleString()}` : 'Price on request';
    const summary = car.description
        ? car.description.replace(/<[^>]*>/g, '').slice(0, featured ? 220 : 120)
        : 'A premium Trailblazer listing with complete detail panels and image-led browsing.';

    return (
        <Link to={`/car/${car._id}`} className="group block h-full rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <article className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] ${featured ? 'lg:flex-row' : ''}`}>
                <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'lg:w-[52%] aspect-[4/3] lg:aspect-auto' : 'aspect-[16/10]'}`}>
                    <img
                        src={imageUrl}
                        alt={`${car.brand} ${car.name}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent"></div>

                    <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-sm ${isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/80 text-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-slate-400'}`}></span>
                            {isAvailable ? 'Available' : car.availability_status}
                        </span>
                    </div>

                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
                            {fuelIcon(car.fuel_type)} {car.fuel_type}
                        </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">{car.brand}</div>
                            <div className="mt-2 text-2xl font-black leading-tight">{car.name}</div>
                        </div>
                        {car.model_year && (
                            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
                                {car.model_year}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex flex-1 flex-col p-5 md:p-6 ${featured ? 'lg:justify-between lg:p-8' : ''}`}>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{car.body_type || 'Curated listing'}</span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{car.registration_city || 'Trailblazer'}</span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-600">
                        {summary}
                        {car.description && car.description.replace(/<[^>]*>/g, '').length > (featured ? 220 : 120) ? '...' : ''}
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Transmission</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{car.transmission || 'N/A'}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Seats</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{car.seating_capacity ? `${car.seating_capacity}` : 'N/A'}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Range</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{car.range || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ex-showroom</div>
                                <div className="mt-2 text-2xl font-black text-slate-900">{priceLabel}</div>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-accent">
                                View Details
                                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default CarCard;
