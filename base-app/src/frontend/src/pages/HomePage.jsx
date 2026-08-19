import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';

const HomePage = () => {
    const navigate = useNavigate();
    const [discountedCars, setDiscountedCars] = useState([]);

    useEffect(() => {
        const fetchDiscountedCars = async () => {
            try {
                const response = await api.get('/api/cars');
                const cars = response.data.cars || response.data || [];

                const offers = cars
                    .filter((car) => {
                        const discount = parseInt(car.discount_percentage, 10) || 0;
                        return discount > 0 && discount < 100;
                    })
                    .slice(0, 6);

                setDiscountedCars(offers);
            } catch (error) {
                console.error('Failed to load discounted cars:', error);
            }
        };

        fetchDiscountedCars();
    }, []);

    const getDiscountedPrice = (car) => {
        const discount = parseInt(car.discount_percentage, 10) || 0;
        return Math.round(car.price - (car.price * discount / 100));
    };

    return (
        <div className="w-full bg-slate-950 flex flex-col font-outfit">
            {/* Hero Section with contained background */}
            <div className="relative w-full min-h-[78vh] flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-center">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
                        alt="Pinnacle Fleet"
                        className="h-full w-full object-cover object-center opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_70%)]"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
                        <h1 id="hero-heading" className="text-balance text-5xl font-black leading-[0.95] text-white md:text-7xl lg:text-[5.5rem] tracking-tighter">
                            Elegance for <br /> <span className="text-blue-500 italic font-serif font-medium lowercase">everyone.</span>
                        </h1>

                        <p className="mt-6 mx-auto max-w-xl text-base leading-relaxed text-slate-300 font-medium tracking-wide">
                            Traverse our curated collection of pristine machines and certified automotive masterpieces. Designed for those who demand excellence in every single mile.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center">
                            <Button
                                id="browse-cars-cta"
                                onClick={() => navigate('/browse')}
                                className="group h-14 rounded-2xl bg-blue-600 px-12 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-900/50 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 border border-blue-400/30"
                            >
                                Explore The Fleet
                                <svg className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {discountedCars.length > 0 && (
                <section
                    id="homepage-discounts-section"
                    className="relative z-20 w-full border-t border-white/10 bg-slate-950 px-6 py-12"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-400">
                                    Exclusive Price Advantages
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                                    Featured Discounted Cars
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-400">
                                    Handpicked vehicles with limited-period savings, transparent pricing, and the same certified Trailblaze quality.
                                </p>
                            </div>

                            <Button
                                id="view-discounted-cars-button"
                                onClick={() => navigate('/browse')}
                                className="h-11 self-start rounded-xl bg-white px-5 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-black/20 transition-all hover:bg-blue-50 md:self-auto"
                            >
                                View All
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {discountedCars.map((car) => {
                                const discountedPrice = getDiscountedPrice(car);

                                return (
                                    <Link
                                        key={car._id}
                                        id={`discount-banner-${car._id}`}
                                        to={`/car/${car._id}`}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-left shadow-2xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.12]"
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                                                <img
                                                    src={car.image_url}
                                                    alt={`${car.brand} ${car.name}`}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div
                                                    id={`discount-banner-${car._id}-badge`}
                                                    className="mb-2 inline-flex rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-950/30"
                                                >
                                                    {car.discount_percentage}% OFF
                                                </div>

                                                <h3 className="truncate text-base font-black text-white">
                                                    {car.brand} {car.name}
                                                </h3>

                                                <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    {car.condition === 'New' ? 'New Arrival Offer' : 'Certified Pre-Owned Offer'}
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                                    <span
                                                        id={`discount-banner-${car._id}-price`}
                                                        className="text-xl font-black tracking-tight text-white"
                                                    >
                                                        ${discountedPrice.toLocaleString()}
                                                    </span>
                                                    <span
                                                        id={`discount-banner-${car._id}-original-price`}
                                                        className="text-xs font-bold text-slate-400 line-through"
                                                    >
                                                        ${car.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <div className="relative z-20 w-full bg-slate-950/40 backdrop-blur-xl border-t border-white/5 pb-8 pt-8">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { t: 'Brand New Machines', d: 'Zero-mile masterpieces direct from heritage collections.', b: 'HERITAGE' },
                            { t: 'Certified Pre-Owned', d: 'Rigorous 220-point diagnostic for factory-grade integrity.', b: 'CERTIFIED' },
                            { t: 'Global Logistics', d: 'Seamless acquisition architecture for a borderless experience.', b: 'CONCIERGE' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-2 text-left">
                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                    {item.b}
                                </div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{item.t}</h2>
                                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                    {item.d}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
