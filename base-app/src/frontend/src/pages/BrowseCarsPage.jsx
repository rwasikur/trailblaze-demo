import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conditionFilter, setConditionFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
            const matchesCondition =
                conditionFilter === 'All' ||
                (conditionFilter === 'New' && car.condition === 'New') ||
                (conditionFilter === 'Pre-Owned' && car.condition === 'Used');

            const isAvailable = car.availability_status === 'Available';

            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery.trim() === '' || [
                car.name,
                car.brand,
                car.description,
                car.fuel_type,
                car.transmission,
                car.body_type,
                car.registration_city,
                car.condition,
                car.model_year?.toString(),
                car.mileage,
                car.total_distance_covered
            ].some(field => field && field.toString().toLowerCase().includes(searchLower));

            return matchesCondition && isAvailable && matchesSearch;
        });
    }, [cars, conditionFilter, searchQuery]);

    return (
        <div className="min-h-full bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-6 pt-4 pb-8">

                {/* Filter & Search Section */}
                <div className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
                        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-fit">
                            {['All', 'New', 'Pre-Owned'].map((opt) => (
                                <button
                                    key={opt}
                                    id={`filter-${opt.toLowerCase().replace(' ', '-')}`}
                                    onClick={() => setConditionFilter(opt)}
                                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${conditionFilter === opt ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80 group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search-input"
                                placeholder="Search by make, model, or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center px-8 py-4 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        <span className="text-blue-400 mr-2 text-sm">{filteredCars.length}</span> 
                        {filteredCars.length === 1 ? 'Vehicle Found' : 'Vehicles Available'}
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
                        <button onClick={() => { setConditionFilter('All'); setSearchQuery(''); }} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
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

