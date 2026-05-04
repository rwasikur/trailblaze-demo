import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [recentCarIds, setRecentCarIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [conditionFilter, setConditionFilter] = useState('All');

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
        let result = cars;
        if (activeFilter === 'Recent') {
            const idMap = new Map(recentCarIds.map((id, i) => [id, i]));
            result = cars
                .filter(car => idMap.has(car._id))
                .sort((a, b) => idMap.get(a._id) - idMap.get(b._id)); // Keep visit order
        } else {
            if (activeFilter === 'New Arrivals') result = cars.filter(c => c.condition === 'New');
            if (activeFilter === 'Pre-Owned') result = cars.filter(c => c.condition === 'Used');
        }

        return result.filter(car => {
            const matchesSearch =
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.body_type?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCondition =
                conditionFilter === 'All' ||
                (conditionFilter === 'New' && car.condition === 'New') ||
                (conditionFilter === 'Pre-Owned' && car.condition === 'Used');

            const isAvailable = car.availability_status === 'Available';

            return matchesSearch && matchesCondition && isAvailable;
        });
    }, [cars, activeFilter, recentCarIds, searchQuery, conditionFilter]);

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

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-8">
                {/* Search and Filter Section */}
                <div className="mb-12 flex flex-col md:flex-row items-center justify-center gap-6">
                    <div className="w-full max-w-2xl flex items-center bg-white border-2 border-slate-100 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 focus-within:ring-8 focus-within:ring-blue-600/10 focus-within:border-blue-600/20 transition-all duration-500 relative">
                        <div className="flex-shrink-0 relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="bg-slate-50/80 border border-slate-100 rounded-[2.25rem] pl-8 pr-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 cursor-pointer hover:bg-white hover:border-slate-200 transition-all duration-300 min-w-[160px] flex items-center justify-between"
                            >
                                <span>{conditionFilter}</span>
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-400">
                                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                    <div className="absolute top-full left-0 mt-3 w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {['All', 'New', 'Pre-Owned'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setConditionFilter(opt);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${conditionFilter === opt ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-600/10 hover:text-blue-600'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-8 w-px bg-slate-100 mx-3"></div>

                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Discover..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-6 py-4 bg-transparent border-none text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center px-8 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <span className="text-blue-600 mr-2 text-sm">{filteredCars.length}</span> Results
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
                    <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit shadow-sm border border-slate-200">
                        {['All', 'Recent', 'New Arrivals', 'Pre-Owned'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-xl px-6 py-3 md:px-8 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeFilter === filter ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {filter}
                            </button>
                        ))}
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
                ) : filteredCars.length === 0 ? (
                    <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white px-6 py-32 text-center shadow-xl">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">No matches found</h2>
                        <p className="mx-auto mt-4 max-w-md text-base text-slate-500 leading-relaxed">We couldn't find any vehicles matching your search criteria.</p>
                        <button onClick={() => { setSearchQuery(''); setConditionFilter('All'); setActiveFilter('All'); }} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
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
                            <div id="car-grid" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {((featuredCar && (activeFilter === 'All' || activeFilter === 'Recent')) ? remainingCars : filteredCars).map((car) => (
                                    <CarCard key={car._id} car={car} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseCarsPage;

