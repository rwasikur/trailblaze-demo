import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
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

    return (
        <div style={{ backgroundColor: '#ffffff', height: 'calc(100vh - 66px)', overflowY: 'auto', margin: '-2rem -5.5% -2rem -5.5%', padding: '2rem 5%' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', margin: 0, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.5px' }}>Browse Cars</h1>
                </div>

                {loading ? (
                    <p>Loading cars...</p>
                ) : cars.length === 0 ? (
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No Cars Available</p>
                ) : (
                    <div className="grid">
                        {cars.map(car => (
                            <div key={car._id} className="car-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <img src={car.image_url || '/car3.avif'} alt={`${car.brand} ${car.name}`} className="car-image" style={{ height: '180px', objectFit: 'cover' }} />
                                <div className="car-content" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h3 className="car-title" style={{ fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 600, color: '#111111' }}>{car.brand} {car.name}</h3>
                                    <div className="car-price" style={{ fontSize: '1rem', marginBottom: '1.2rem', color: '#555555' }}>
                                        <span style={{ fontWeight: 'bold', color: '#111111', fontSize: '1.05rem' }}>${car.price_per_day?.toLocaleString()}</span>
                                    </div>
                                    <button
                                        className="btn btn-slate"
                                        style={{ width: '100%', padding: '0.8rem', marginTop: 'auto', fontSize: '0.95rem', color: '#ffffff', border: 'none' }}
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
