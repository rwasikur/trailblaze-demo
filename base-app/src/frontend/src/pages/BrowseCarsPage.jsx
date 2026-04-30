import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';
import CatalogueHero from '../components/catalogue/CatalogueHero';
import CatalogueHighlights from '../components/catalogue/CatalogueHighlights';

import { BRANDS_MODELS } from '../constants/carData';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }, []);

    const filteredCars = useMemo(() => {
        return cars.filter(car => {
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
    }, [cars, searchQuery, conditionFilter]);

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
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">No matches found</h2>
                        <p className="mx-auto mt-4 max-w-md text-base text-slate-500 leading-relaxed">We couldn't find any vehicles matching your search criteria.</p>
                        <button onClick={() => {setSearchQuery(''); setConditionFilter('All');}} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
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

