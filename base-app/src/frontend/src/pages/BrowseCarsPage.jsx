import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, 
    X, 
    ChevronDown, 
    Car as CarIcon, 
    Settings2, 
    CircleDollarSign,
    Zap,
    History
} from 'lucide-react';
import api from '../api';
import CarCard from '../components/CarCard';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600',
        new: 'bg-emerald-50 text-emerald-600',
        used: 'bg-blue-50 text-blue-600',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const BrowseCarsPage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [conditionFilter, setConditionFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All Brands');
    const [bodyTypeFilter, setBodyTypeFilter] = useState('All Body Types');
    const [fuelTypeFilter, setFuelTypeFilter] = useState('All Fuel Types');
    const [transmissionFilter, setTransmissionFilter] = useState('All Transmissions');
    const [priceFilter, setPriceFilter] = useState('All Prices');
    const [showFilters, setShowFilters] = useState(false);

    const resetFilters = () => {
        setConditionFilter('All');
        setBrandFilter('All Brands');
        setBodyTypeFilter('All Body Types');
        setFuelTypeFilter('All Fuel Types');
        setTransmissionFilter('All Transmissions');
        setPriceFilter('All Prices');
        setShowFilters(false);
    };

    const [selectedCars, setSelectedCars] = useState(() => {
        const saved = localStorage.getItem('trailblaze_compare_list');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('trailblaze_compare_list', JSON.stringify(selectedCars));
    }, [selectedCars]);

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

    const toggleCompare = (car, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const carId = car._id;
        const isSelected = selectedCars.includes(carId);

        if (!isSelected && selectedCars.length >= 4) {
            import('react-toastify').then(({ toast }) => {
                toast.warning('Maximum 4 vehicles can be compared at once', {
                    position: "bottom-right",
                    autoClose: 3000,
                    theme: "dark"
                });
            });
            return;
        }

        if (!isSelected) {
            import('react-toastify').then(({ toast }) => {
                toast.success(`${car.name} added to comparison`, {
                    position: "bottom-right",
                    autoClose: 2000,
                    theme: "dark"
                });
            });
        }

        setSelectedCars(prev => 
            prev.includes(carId)
                ? prev.filter(id => id !== carId)
                : [...prev, carId]
        );
    };

    const filteredCars = useMemo(() => {
        return cars.filter(car => {
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

            return matchesCondition && matchesBrand && matchesBodyType && matchesFuelType && matchesTransmission && matchesPrice() && isAvailable;
        });
    }, [cars, conditionFilter, brandFilter, bodyTypeFilter, fuelTypeFilter, transmissionFilter, priceFilter]);

    const uniqueBrands = useMemo(() => ['All Brands', ...new Set(cars.map(c => c.brand))].sort(), [cars]);
    const uniqueBodyTypes = useMemo(() => ['All Body Types', ...new Set(cars.filter(c => c.body_type).map(c => c.body_type))].sort(), [cars]);
    const fuelTypes = ['All Fuel Types', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
    const transmissions = ['All Transmissions', 'Manual', 'Automatic'];
    const priceRanges = ['All Prices', 'Under 5L', '5L - 10L', '10L - 20L', '20L - 40L', 'Above 40L'];

    return (
        <div className="min-h-full bg-slate-50 relative pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-8 bg-blue-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Public Catalogue</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                Premium <span className="text-blue-600">Inventory</span>
                            </h1>
                            <p className="mt-4 text-slate-500 font-medium max-w-xl text-lg">
                                Explore our curated collection of high-performance vehicles and luxury cruisers.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 p-3 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
                        {['All', 'New', 'Pre-Owned'].map((opt) => (
                            <button
                                key={opt}
                                id={`filter-${opt.toLowerCase().replace(' ', '-')}`}
                                data-testid={`condition-filter-${opt}`}
                                onClick={() => setConditionFilter(opt)}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${conditionFilter === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            data-testid="filter-toggle"
                            id="filter-toggle"
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
                                                    id="brand-filter"
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
                                                    id="body-type-filter"
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
                                                            data-testid={`transmission-filter-${type}`}
                                                            onClick={() => setTransmissionFilter(type)}
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
                                                            data-testid={`fuel-filter-${type}`}
                                                            onClick={() => setFuelTypeFilter(type)}
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
                                                        data-testid={`price-filter-${range}`}
                                                        onClick={() => setPriceFilter(range)}
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
                                        id="reset-filters"
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
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CarIcon className="text-blue-600/30" size={32} />
                            </div>
                        </div>
                        <h3 className="mt-8 text-xl font-black text-slate-900 tracking-tight">Scanning Inventory...</h3>
                        <p className="mt-2 text-slate-400 font-medium">Fetching the latest high-performance vehicles for you.</p>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/20">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                            <X className="text-slate-300" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">No matches found</h2>
                        <p className="mx-auto mt-4 max-w-md text-base text-slate-500 leading-relaxed">We couldn't find any vehicles matching your filter criteria.</p>
                        <button onClick={resetFilters} className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95">Clear All Filters</button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div id="car-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCars.map((car) => (
                                <CarCard
                                    key={car._id}
                                    car={car}
                                    isComparing={selectedCars.includes(car._id)}
                                    onCompareToggle={(e) => toggleCompare(car, e)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Comparison Button */}
            {selectedCars.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500 flex items-center bg-slate-900 p-2 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-xl">
                    <button 
                        onClick={() => {
                            if (selectedCars.length < 2) {
                                import('react-toastify').then(({ toast }) => {
                                    toast.info('Select at least 2 vehicles to compare', {
                                        position: "bottom-right",
                                        autoClose: 3000,
                                        theme: "dark"
                                    });
                                });
                                return;
                            }
                            navigate(`/compare?ids=${selectedCars.join(',')}`);
                        }}
                        className="text-white px-8 py-4 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-6 hover:bg-blue-600 active:scale-95 transition-all duration-500 group"
                    >
                        <span className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <a href="#" onClick={(e) => e.preventDefault()} className="cursor-pointer">Compare Now</a>
                        </span>
                        <span className="bg-blue-600 text-white h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-inner group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            {selectedCars.length}
                        </span>
                    </button>
                    
                    <div className="w-px h-8 bg-slate-700/50 mx-2"></div>
                    
                    <button
                        onClick={() => setSelectedCars([])}
                        className="text-slate-400 h-12 w-12 mr-1 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all duration-300 group"
                        title="Clear Comparison"
                    >
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BrowseCarsPage;
