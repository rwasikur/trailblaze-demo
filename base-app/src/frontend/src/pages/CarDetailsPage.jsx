import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
const CarDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [bookingName, setBookingName] = useState('');
    useEffect(() => {
        const fetchCar = async () => {
            try {
                const { data } = await api.get(`/api/cars/${id}`);
                setCar(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching car details', error);
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleBook = async () => {
        if (!bookingName || bookingName.trim() === '') return;

        try {
            await api.post(`/api/cars/${id}/book`, { requested_by: bookingName.trim() });
            toast.success("Booking request submitted! We will contact you soon.");
            setCar({ ...car, availability_status: 'Pending' });
            setTimeout(() => {
                setShowModal(false);
                setBookingName('');
            }, 1000);
        } catch (error) {
            console.error('Error booking car', error);
            toast.error("Failed to submit booking. Please try again.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading details...</p>;
    if (!car) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Car not found.</p>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '2rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>
                &larr; Back to Catalogue
            </button>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={car.image_url || '/car3.avif'} alt={`${car.brand} ${car.name}`} style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{car.brand}</div>
                            <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>{car.name}</h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>₹{car.price_per_day?.toLocaleString()}</div>
                            <div style={{ color: 'var(--text-muted)' }}>per day</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Year</strong> {car.model_year}</div>
                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Transmission</strong> {car.transmission}</div>
                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fuel Type</strong> {car.fuel_type}</div>
                        <div><strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Seats</strong> {car.seating_capacity}</div>
                        <div>
                            <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</strong>
                            <span style={{ color: car.availability_status === 'Available' ? '#00E5FF' : '#FF5252' }}>
                                {car.availability_status || 'Available'}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Overview</h3>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem' }}>{car.description || 'A stunning premium vehicle awaiting your test drive.'}</p>
                    </div>

                    <button
                        className="btn"
                        style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', background: 'linear-gradient(135deg, var(--accent) 0%, #005F73 100%)', textTransform: 'uppercase', letterSpacing: '2px' }}
                        onClick={() => setShowModal(true)}
                        disabled={car.availability_status !== 'Available'}
                    >
                        {car.availability_status === 'Available' ? 'Book Now' : 'Not Available'}
                    </button>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', background: 'var(--bg-color)', padding: '2.5rem', border: '1px solid var(--accent)' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Complete Booking</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>To request the <strong>{car.brand} {car.name}</strong>, please enter your name below.</p>

                        <input
                            type="text"
                            placeholder="Your full name"
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', marginBottom: '1.5rem', fontFamily: 'Inter' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--glass-border)' }}>Cancel</button>
                            <button onClick={handleBook} className="btn" style={{ flex: 1 }} disabled={!bookingName.trim()}>Submit Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;
