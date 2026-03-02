import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CarRating from '../components/CarRating';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const { data } = await axios.get('http://localhost:8000/api/cars');
                setCars(data.cars);
            } catch (error) {
                console.error('Error fetching cars', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    const filteredCars = cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 66px)', margin: '-2rem -5.5% -2rem -5.5%', padding: '2rem 5%' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#111111', fontWeight: 'bold', letterSpacing: '1px' }}>Browse Cars</h1>
                    <input
                        type="text"
                        placeholder="Search by brand or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '350px',
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            background: '#f8f9fa',
                            color: '#333333',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    />
                </div>

                {loading ? (
                    <p>Loading cars...</p>
                ) : filteredCars.length === 0 ? (
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No Cars Available</p>
                ) : (
                    <div className="grid">
                        {filteredCars.map(car => (
                            <div key={car._id} className="car-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <img src={car.image_url || '/car3.avif'} alt={`${car.brand} ${car.name}`} className="car-image" style={{ height: '180px', objectFit: 'cover' }} />
                                <div className="car-content" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <h3 className="car-title" style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600, color: '#111111', lineHeight: 1.2 }}>{car.brand} {car.name}</h3>
                                        <CarRating carId={car._id} readOnly={true} lightTheme={true} />
                                    </div>
                                    <div className="car-price" style={{ fontSize: '1.05rem', marginBottom: '1.2rem', color: '#555555' }}>
                                        <span style={{ fontWeight: 'bold', color: '#111111', fontSize: '1.15rem' }}>₹{car.price_per_day?.toLocaleString()}</span> / day
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
