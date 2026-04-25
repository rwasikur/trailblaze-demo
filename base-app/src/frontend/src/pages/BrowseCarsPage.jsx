import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';
import CatalogueHero from '../components/catalogue/CatalogueHero';
import CatalogueHighlights from '../components/catalogue/CatalogueHighlights';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState('All');
    const [recentCarIds, setRecentCarIds] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/cars');
                setCars(data.cars || []);
            } catch (error) {
                console.error('Error fetching cars', error);
                setCars([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();

        const sync = () => {
            try {
                const raw = localStorage.getItem('recentCars');
                setRecentCarIds(JSON.parse(raw || '[]'));
            } catch (e) {
                console.error('Error parsing recentCars', e);
                setRecentCarIds([]);
            }
        };
        sync();
        window.addEventListener('storage', sync);
        window.addEventListener('recentCarsUpdated', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('recentCarsUpdated', sync);
        };
    }, []);

    const filteredCars = useMemo(() => {
        if (activeFilter === 'Recent') {
            const idMap = new Map(recentCarIds.map((id, i) => [id, i]));
            return cars
                .filter(car => idMap.has(car._id))
                .sort((a, b) => idMap.get(a._id) - idMap.get(b._id)); // Keep visit order
        }
        if (activeFilter === 'All') return cars;
        if (activeFilter === 'New Arrivals') return cars.filter(c => c.condition === 'New');
        if (activeFilter === 'Pre-Owned') return cars.filter(c => c.condition === 'Used');
        return cars;
    }, [cars, activeFilter, recentCarIds]);

    const featuredCar = useMemo(() => filteredCars[0], [filteredCars]);
    const remainingCars = useMemo(() => filteredCars.slice(1), [filteredCars]);

    return (
        <div className="min-h-full bg-slate-50">
            {/* Elite Masterpiece Hero */}
            <div className="bg-slate-950 px-6 py-24 text-center lg:py-36 relative overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">
                {/* Background Layers */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] opacity-40"></div>
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>

                {/* Floating Orbs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/5 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <div className="relative z-10 mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 backdrop-blur-xl mb-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000">
                        The Trailblaze Collection
                    </div>

                    <h1 className="text-4xl font-black tracking-tighter text-white md:text-6xl lg:text-7xl leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Find your next <br />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-blue-600">masterpiece</span>
                            <span className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></span>
                        </span>.
                    </h1>

                    <p className="mt-10 text-base text-slate-400 md:text-lg max-w-2xl mx-auto leading-[1.6] font-medium animate-in fade-in duration-1000 delay-300">
                        Our most exclusive fleet is waiting for you just below. From track-ready machines to certified luxury icons, your perfect drive is <span className="text-slate-200 font-bold">one scroll away</span>.
                    </p>

                    {/* Scroll Indicator */}
                    <div className="mt-16 animate-bounce opacity-40 hover:opacity-100 transition-opacity cursor-default hidden md:block">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Explore the Fleet</span>
                            <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-20">
                {/* Filter Controls */}
                <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shadow-sm border border-slate-200">
                        {['All', 'Recent', 'New Arrivals', 'Pre-Owned'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-xl px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeFilter === filter ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-bold text-slate-400 tracking-wide">
                        Showing <span className="text-slate-900">{filteredCars.length}</span> luxury listings
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white py-24 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                        <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                        <p className="mt-5 text-lg font-medium text-slate-500">Loading the collection...</p>
                    </div>
                ) : cars.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-24 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                        <h2 className="text-3xl font-black text-slate-900">No cars found</h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">The catalogue is empty right now.</p>
                    </div>
                ) : (
                    <div className="space-y-16 lg:space-y-24">
                        {featuredCar && (activeFilter === 'All' || activeFilter === 'Recent') && (
                            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="flex flex-col justify-center rounded-[3rem] border border-slate-200 bg-white p-8 shadow-2xl md:p-12">
                                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-8">
                                        Editor's Platinum Pick
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl">Innovation meets <br /><span className="text-slate-400 font-serif italic font-medium">the open road</span>.</h2>
                                    <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-500">
                                        Each vehicle in our featured spotlight represents the pinnacle of its class, offering unmatched performance and verified history.
                                    </p>
                                    <div className="mt-10 flex flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">Certified Integrity</span>
                                        </div>
                                        <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500 md:block">
                                            Premium spotlight
                                        </div>
                                    </div>
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                                        Start with the hero vehicle, then continue into the full grid below. The layout is
                                        now split into a prominent feature and a clean browsing wall for the rest of the catalogue.
                                    </p>
                                </div>
                                <CarCard car={featuredCar} featured />
                            </section>
                        )}

                        <section className="space-y-12">
                            {filteredCars.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-300 bg-white py-24 text-center shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">No matches found</h2>
                                    <p className="mx-auto mt-3 max-w-sm text-base text-slate-500">
                                        We couldn't find any vehicles matching your current selection.
                                        Try adjusting your filters or browsing the full collection.
                                    </p>
                                </div>
                            ) : (
                                <div id="car-grid" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {((featuredCar && (activeFilter === 'All' || activeFilter === 'Recent')) ? remainingCars : filteredCars).map((car) => (
                                        <CarCard key={car._id} car={car} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseCarsPage;

