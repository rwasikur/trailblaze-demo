import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [recentCarIds, setRecentCarIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleClearRecent = () => {
        localStorage.removeItem('recentCars');
        window.dispatchEvent(new Event('recentCarsUpdated'));
        setRecentCarIds([]);
    };

    const sync = () => {
        try {
            const raw = localStorage.getItem('recentCars');
            let recent = JSON.parse(raw || '[]');
            if (recent.length > 5) {
                recent = recent.slice(0, 5);
                localStorage.setItem('recentCars', JSON.stringify(recent));
            }
            setRecentCarIds(recent);
        } catch (e) {
            setRecentCarIds([]);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
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
        sync();

        window.addEventListener('storage', sync);
        window.addEventListener('recentCarsUpdated', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('recentCarsUpdated', sync);
        };
    }, []);

    const filteredCars = useMemo(() => {
        let result = cars;
        if (activeFilter === 'Recent') {
            const idMap = new Map(recentCarIds.map((id, i) => [id, i]));
            result = cars
                .filter(car => idMap.has(car._id))
                .sort((a, b) => idMap.get(a._id) - idMap.get(b._id));
        } else if (activeFilter === 'New') {
            result = cars.filter(c => c.condition === 'New');
        } else if (activeFilter === 'Pre-Owned') {
            result = cars.filter(c => c.condition === 'Used');
        }

        return result.filter(car => {
            const matchesSearch =
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.body_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const isAvailable = car.availability_status === 'Available';

            return matchesSearch && isAvailable;
        });
    }, [cars, activeFilter, recentCarIds, searchQuery]);

    const featuredCar = useMemo(() => {
        if ((activeFilter === 'All' || activeFilter === 'Recent') && recentCarIds.length > 0) {
            return cars.find(c => c._id === recentCarIds[0]) || null;
        }
        return null;
    }, [cars, activeFilter, recentCarIds]);

    const remainingCars = useMemo(() => {
        if (!featuredCar) return filteredCars;
        return filteredCars.filter(c => c._id !== featuredCar._id);
    }, [filteredCars, featuredCar]);

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-8">
                <div className="mb-12 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 hidden md:block" />

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                            {['All', 'Recent', 'New', 'Pre-Owned'].map((opt) => (
                                <button
                                    key={opt}
                                    id={`filter-${opt.toLowerCase().replace(' ', '-')}`}
                                    onClick={() => setActiveFilter(opt)}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center px-8 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            <span className="text-blue-600 mr-2 text-sm">{filteredCars.length}</span> Results
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center md:justify-end">
                        {activeFilter === 'Recent' && recentCarIds.length > 0 && (
                            <button
                                id="clear-recent-button"
                                onClick={handleClearRecent}
                                className="group flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-all duration-300 shadow-sm active:scale-95"
                            >
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">Clear History</span>
                            </button>
                        )}
                    </div>
                </div>


                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-6 shadow-blue-200 shadow-lg"></div>
                        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Curating the collection...</p>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white px-6 py-32 text-center shadow-xl">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {activeFilter === 'Recent' ? 'No recent cars' : 'No matches found'}
                        </h2>
                        <p className="mx-auto mt-4 max-w-md text-base text-slate-500 leading-relaxed">
                            {activeFilter === 'Recent' 
                                ? "You haven't viewed any vehicles yet. Start exploring our catalogue to track your history."
                                : "We couldn't find any vehicles matching your search criteria."
                            }
                        </p>
                        <button onClick={() => { setActiveFilter('All'); }} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <section id="car-grid" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCars.map((car) => (
                                <CarCard key={car._id} car={car} />
                            ))}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};


export default BrowseCarsPage;
