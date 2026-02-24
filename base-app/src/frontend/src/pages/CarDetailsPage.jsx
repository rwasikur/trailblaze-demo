import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CarDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const { data } = await axios.get(`http://localhost:8000/api/cars/${id}`);
                setCar(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching car details', error);
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    if (loading) return <p style={{ textAlign: 'center' }}>Loading details...</p>;
    if (!car) return <p style={{ textAlign: 'center' }}>Car not found.</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '2rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>
                &larr; Back to Catalogue
            </button>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={car.imageUrl || '/car3.avif'} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{car.make} {car.model}</h1>
                        <div style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>${car.price.toLocaleString()}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        <span><strong>Year:</strong> {car.year}</span>
                        <span><strong>Mileage:</strong> {car.mileage.toLocaleString()} miles</span>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Overview</h3>
                        <p style={{ lineHeight: '1.8' }}>{car.description || 'A stunning premium vehicle awaiting your test drive.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarDetailsPage;
