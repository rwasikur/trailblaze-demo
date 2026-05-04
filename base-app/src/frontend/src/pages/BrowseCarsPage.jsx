import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    X, 
    ChevronDown, 
    Car as CarIcon, 
    Fuel, 
    Settings2, 
    CircleDollarSign,
    Zap,
    History,
    Gauge
} from 'lucide-react';
import api from '../api';
import CarCard from '../components/CarCard';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [conditionFilter, setConditionFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All Brands');
    const [bodyTypeFilter, setBodyTypeFilter] = useState('All Body Types');
    const [fuelTypeFilter, setFuelTypeFilter] = useState('All Fuel Types');
    const [transmissionFilter, setTransmissionFilter] = useState('All Transmissions');
    const [priceFilter, setPriceFilter] = useState('All Prices');
    const [showFilters, setShowFilters] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const resetFilters = () => {
        setSearchQuery('');
        setConditionFilter('All');
        setBrandFilter('All Brands');
        setBodyTypeFilter('All Body Types');
        setFuelTypeFilter('All Fuel Types');
        setTransmissionFilter('All Transmissions');
        setPriceFilter('All Prices');
        setShowFilters(false);
        setIsDropdownOpen(false);
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

            const matchesBrand = brandFilter === 'All Brands' || car.brand === brandFilter;
            const matchesBodyType = bodyTypeFilter === 'All Body Types' || car.body_type === bodyTypeFilter;
            const matchesFuelType = fuelTypeFilter === 'All Fuel Types' || car.fuel_type === fuelTypeFilter;
            const matchesTransmission = transmissionFilter === 'All Transmissions' || car.transmission === transmissionFilter;

            const matchesPrice = () => {
                if (priceFilter === 'All Prices') return true;
                const price = car.price;
                if (priceFilter === 'Under 5L') return price < 500000;
                if (priceFilter === '5L - 10L') return price >= 500000 && price <= 1000000;
                if (priceFilter === '10L - 20L') return price > 1000000 && price <= 2000000;
                if (priceFilter === '20L - 40L') return price > 2000000 && price <= 4000000;
                if (priceFilter === 'Above 40L') return price > 4000000;
                return true;
            };

            const isAvailable = car.availability_status === 'Available';

            return matchesSearch && matchesCondition && matchesBrand && matchesBodyType && matchesFuelType && matchesTransmission && matchesPrice() && isAvailable;
        });
    }, [cars, searchQuery, conditionFilter, brandFilter, bodyTypeFilter, fuelTypeFilter, transmissionFilter, priceFilter]);

    const uniqueBrands = useMemo(() => ['All Brands', ...new Set(cars.map(c => c.brand))].sort(), [cars]);
    const uniqueBodyTypes = useMemo(() => ['All Body Types', ...new Set(cars.filter(c => c.body_type).map(c => c.body_type))].sort(), [cars]);
    const fuelTypes = ['All Fuel Types', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
    const transmissions = ['All Transmissions', 'Manual', 'Automatic'];
    const priceRanges = ['All Prices', 'Under 5L', '5L - 10L', '10L - 20L', '20L - 40L', 'Above 40L'];


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
                                                data-testid={`condition-filter-${opt}`}
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
                                data-testid="search-input"
                                placeholder="Discover..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-6 py-4 bg-transparent border-none text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            data-testid="filter-toggle"
                            className={`flex items-center px-6 py-4 rounded-[2rem] border-2 transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-600/30'}`}
                        >
                            <Filter className={`w-4 h-4 mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                            {showFilters ? 'Hide Filters' : 'Filters'}
                        </button>

                        <div className="hidden sm:flex items-center px-8 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            <span className="text-blue-600 mr-2 text-sm">{filteredCars.length}</span> Results
                        </div>
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 48 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {/* Brand & Body Type Group */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <CarIcon size={16} />
                                            </div>
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Vehicle Type</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative group">
                                                <select
                                                    value={brandFilter}
                                                    data-testid="brand-filter"
                                                    onChange={(e) => setBrandFilter(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="All Brands">Select Brand</option>
                                                    {uniqueBrands.filter(b => b !== 'All Brands').map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>

                                            <div className="relative group">
                                                <select
                                                    value={bodyTypeFilter}
                                                    data-testid="body-type-filter"
                                                    onChange={(e) => setBodyTypeFilter(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="All Body Types">Select Body Style</option>
                                                    {uniqueBodyTypes.filter(b => b !== 'All Body Types').map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specifications Group */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                                <Settings2 size={16} />
                                            </div>
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Specifications</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {transmissions.map(type => {
                                                    const label = type === 'All Transmissions' ? 'All' : type;
                                                    const isActive = transmissionFilter === type;
                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => setTransmissionFilter(type)}
                                                            data-testid={`transmission-filter-${type}`}
                                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {fuelTypes.map(type => {
                                                    const label = type === 'All Fuel Types' ? 'Any Fuel' : type;
                                                    const isActive = fuelTypeFilter === type;
                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => setFuelTypeFilter(type)}
                                                            data-testid={`fuel-filter-${type}`}
                                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                                        >
                                                            {type === 'Electric' && <Zap size={10} className="inline mr-1 -mt-0.5" />}
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Budget Group */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                <CircleDollarSign size={16} />
                                            </div>
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Budget Range</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {priceRanges.map(range => {
                                                const isActive = priceFilter === range;
                                                return (
                                                    <button
                                                        key={range}
                                                        onClick={() => setPriceFilter(range)}
                                                        data-testid={`price-filter-${range}`}
                                                        className={`px-4 py-3 rounded-2xl text-[10px] font-bold transition-all duration-300 border-2 ${isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-100 hover:bg-emerald-50/30'}`}
                                                    >
                                                        {range}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                            <History size={14} />
                                            Recent:
                                        </div>
                                        <div className="flex gap-2">
                                            {['SUV', 'Automatic', 'Under 10L'].map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-full border border-slate-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetFilters}
                                        data-testid="reset-filters"
                                        className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors group"
                                    >
                                        <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                        <button onClick={resetFilters} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
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

