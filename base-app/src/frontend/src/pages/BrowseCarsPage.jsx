import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, SortAsc, Grid, List, X, Fuel, Users, ArrowRight } from 'lucide-react';
import api from '../api';
import CarCard from '../components/CarCard';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [fuelFilter, setFuelFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isGridView, setIsGridView] = useState(true);
    const navigate = useNavigate();

    const categories = ['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric', 'Sports'];

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const { data } = await api.get('/api/cars');
                setCars(data.cars || []);
                setFilteredCars(data.cars || []);
            } catch (error) {
                console.error('Error fetching cars', error);
                setCars([]);
                setFilteredCars([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    useEffect(() => {
        let result = [...cars];

        // Search — unchanged from original logic
        if (searchTerm) {
            result = result.filter(car =>
                car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                car.brand.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Fuel filter — unchanged
        if (fuelFilter !== 'All') result = result.filter(car => car.fuel_type === fuelFilter);

        // Body Type filter — fixed to use body_type field
        if (categoryFilter !== 'All') result = result.filter(car => car.body_type === categoryFilter || car.category === categoryFilter);

        // Sort — fixed: use price_per_day (the actual backend field) with fallback to price
        if (sortBy === 'priceLow') {
            result.sort((a, b) => (a.price_per_day ?? a.price ?? 0) - (b.price_per_day ?? b.price ?? 0));
        } else if (sortBy === 'priceHigh') {
            result.sort((a, b) => (b.price_per_day ?? b.price ?? 0) - (a.price_per_day ?? a.price ?? 0));
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredCars(result);
    }, [searchTerm, fuelFilter, categoryFilter, sortBy, cars]);

    const clearAll = () => { setSearchTerm(''); setFuelFilter('All'); setCategoryFilter('All'); };
    const hasActiveFilters = searchTerm || fuelFilter !== 'All' || categoryFilter !== 'All';

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 66px)', margin: '-2rem -5.5% -2rem -5.5%' }}>

            {/* ── COMPACT HERO STRIP ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f1923 0%, #1c3040 60%, #243b4a 100%)',
                padding: '2.5rem 5% 2rem',
                borderBottom: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(58,123,213,0.1) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 900, margin: '0 0 0.3rem', letterSpacing: '-0.5px' }}>
                            Find Your Perfect Car
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: 0 }}>
                            {cars.length > 0 ? `${cars.length} vehicles in our inventory` : 'Browse our full inventory'}
                        </p>
                    </div>

                    {/* Search bar */}
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
                        padding: '6px', borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        display: 'flex', gap: '8px'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                            <input
                                type="text"
                                placeholder="Search by brand or model (e.g. BMW, Civic, Fortuner...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.85rem 2.5rem 0.85rem 2.8rem',
                                    background: 'transparent', border: 'none',
                                    borderRadius: '10px', color: 'white',
                                    fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                            {searchTerm && (
                                <X size={16} onClick={() => setSearchTerm('')} style={{
                                    position: 'absolute', right: '1rem', top: '50%',
                                    transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer'
                                }} />
                            )}
                        </div>
                        <button className="btn btn-slate" style={{ padding: '0 1.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* ── STICKY FILTER BAR ── */}
            <div style={{
                background: 'rgba(17,24,32,0.96)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '0.75rem 5%',
                position: 'sticky', top: '66px', zIndex: 50,
                backdropFilter: 'blur(16px)'
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    display: 'flex', alignItems: 'center',
                    gap: '0.75rem', flexWrap: 'wrap'
                }}>
                    {/* Category chips */}
                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(cat)}
                                style={{ fontSize: '0.78rem', padding: '0.3rem 0.85rem' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '22px', background: 'var(--glass-border)', flexShrink: 0 }} />

                    {/* Fuel filter */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <SlidersHorizontal size={13} style={{ position: 'absolute', left: '0.65rem', color: 'var(--accent-light)', pointerEvents: 'none', zIndex: 1 }} />
                        <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="filter-select" style={{ paddingLeft: '1.9rem' }}>
                            <option value="All">All Fuels</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="CNG">CNG</option>
                        </select>
                    </div>

                    {/* Sort filter */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <SortAsc size={13} style={{ position: 'absolute', left: '0.65rem', color: 'var(--accent-light)', pointerEvents: 'none', zIndex: 1 }} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select" style={{ paddingLeft: '1.9rem' }}>
                            <option value="newest">Newest First</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Grid / List toggle */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button className={`view-toggle-btn ${isGridView ? 'active' : ''}`} onClick={() => setIsGridView(true)} title="Grid view">
                            <Grid size={15} />
                        </button>
                        <button className={`view-toggle-btn ${!isGridView ? 'active' : ''}`} onClick={() => setIsGridView(false)} title="List view">
                            <List size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── RESULTS ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 5% 4rem' }}>

                {/* Results count + active filter tags */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '0.25rem' }}>
                        Showing <strong style={{ color: 'var(--text-main)' }}>{filteredCars.length}</strong> of <strong style={{ color: 'var(--text-main)' }}>{cars.length}</strong> vehicles
                    </span>
                    {searchTerm && (
                        <span className="tag-pill">"{searchTerm}" <X size={12} onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} /></span>
                    )}
                    {fuelFilter !== 'All' && (
                        <span className="tag-pill">{fuelFilter} <X size={12} onClick={() => setFuelFilter('All')} style={{ cursor: 'pointer' }} /></span>
                    )}
                    {categoryFilter !== 'All' && (
                        <span className="tag-pill">{categoryFilter} <X size={12} onClick={() => setCategoryFilter('All')} style={{ cursor: 'pointer' }} /></span>
                    )}
                    {hasActiveFilters && (
                        <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                            Clear all
                        </button>
                    )}
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="grid">
                        {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="skeleton-card" />)}
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <Filter size={52} style={{ color: 'var(--glass-border)', marginBottom: '1.25rem' }} />
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No vehicles match your search</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your filters or clearing the search</p>
                        <button className="btn" onClick={clearAll}>Clear All Filters</button>
                    </div>
                ) : isGridView ? (
                    <div className="grid">
                        {filteredCars.map(car => <CarCard key={car._id} car={car} />)}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredCars.map(car => (
                            <div key={car._id} className="car-card-list">
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <img
                                        src={car.image_url || '/car3.avif'}
                                        alt={`${car.brand} ${car.name}`}
                                        style={{ width: '280px', height: '200px', objectFit: 'cover', display: 'block' }}
                                    />
                                    {car.body_type && <span className="badge">{car.body_type}</span>}
                                </div>
                                <div className="car-content" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', fontWeight: 700 }}>{car.brand} {car.name}</h3>
                                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                            {car.fuel_type && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Fuel size={13} /> {car.fuel_type}</span>}
                                            {car.seating_capacity && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={13} /> {car.seating_capacity} Seats</span>}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.6, maxWidth: '480px' }}>
                                            {car.description || `Experience the ${car.brand} ${car.name} — engineered for performance, comfort, and reliability.`}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
                                            ₹{(car.price_per_day ?? car.price)?.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Ex-showroom price</div>
                                        <button className="btn btn-slate" onClick={() => navigate(`/car/${car._id}`)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                                            View Details <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseCarsPage;