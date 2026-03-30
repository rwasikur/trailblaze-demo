import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (sortOption) {
                    const parts = sortOption.split('-');
                    if (parts.length === 2) {
                        params.append('sort', parts[0]);
                        params.append('order', parts[1]);
                    }
                }

                const { data } = await api.get(`/api/cars?${params.toString()}`);
                setCars(data.cars || []);
            } catch (error) {
                console.error('Error fetching cars', error);
                setCars([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, [sortOption]);

    return (
        <div style={{ backgroundColor: '#ffffff', height: 'calc(100vh - 66px)', overflowY: 'auto', margin: '-2rem -5.5% -2rem -5.5%', padding: '2rem 5%' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px' }}>Browse Cars</h1>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Sort By</label>
                        <select value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option value="">Newest Added</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="year-desc">Year: Newest First</option>
                            <option value="year-asc">Year: Oldest First</option>
                            <option value="popularity-desc">Popularity: Most Popular</option>
                            <option value="popularity-asc">Popularity: Least Popular</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading fleet...</p>
                    </div>
                ) : cars.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
                        <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No Cars Found</h2>
                        <p style={{ color: '#64748b' }}>No vehicles are currently available.</p>
                    </div>
                ) : (
                    <div className="grid">
                        {cars.map(car => (
                            <div key={car._id} className="car-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'; }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={car.image_url || '/car3.avif'} alt={`${car.brand} ${car.name}`} className="car-image" style={{ height: '220px', width: '100%', objectFit: 'cover' }} />
                                    {car.availability_status !== 'Available' && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.8)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                                            {car.availability_status}
                                        </div>
                                    )}
                                </div>
                                <div className="car-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 className="car-title" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{car.brand} {car.name}</h3>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span>{car.model_year}</span> • <span>{car.fuel_type}</span> • <span>{car.transmission}</span>
                                    </div>
                                    <div className="car-price" style={{ fontSize: '1rem', marginTop: 'auto', marginBottom: '1.5rem' }}>
                                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem' }}>${car.price_per_day?.toLocaleString()}</span>
                                    </div>
                                    <button
                                        className="btn btn-slate"
                                        style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', color: '#ffffff', background: '#4A6572', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.target.style.background = '#374f5a'}
                                        onMouseOut={e => e.target.style.background = '#4A6572'}
                                        onClick={() => navigate(`/car/${car._id}`)}
                                    >
                                        View Details
                                    </button>
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
