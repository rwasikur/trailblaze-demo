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
    const [bookingPhone, setBookingPhone] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        if (!bookingName || bookingName.trim() === '' || !bookingPhone || bookingPhone.trim() === '') {
            return toast.error("Please enter your name and contact info.");
        }

        try {
            await api.post(`/api/cars/${id}/book`, { requested_by: `${bookingName.trim()} (${bookingPhone.trim()})` });
            toast.success("Booking request submitted! We will contact you soon.");
            setCar({ ...car, availability_status: 'Pending' });
            setTimeout(() => {
                setShowModal(false);
                setBookingName('');
                setBookingPhone('');
            }, 1000);
        } catch (error) {
            console.error('Error booking car', error);
            toast.error("Failed to submit booking. Please try again.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading details...</p>;
    if (!car) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Car not found.</p>;

    const allImages = [car.image_url || '/car3.avif'];
    if (car.secondary_images && Array.isArray(car.secondary_images)) {
        allImages.push(...car.secondary_images);
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <div style={{ backgroundColor: '#ffffff', height: 'calc(100vh - 66px)', margin: '-2rem -5.5% -2rem -5.5%', padding: '1rem 5%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', color: '#334155', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ flexShrink: 0, marginBottom: '0.8rem', alignSelf: 'flex-start', background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderRadius: '8px', padding: '0.4rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>
                    &larr; Back to Catalogue
                </button>

                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
                    <div style={{ width: '40%', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', boxSizing: 'border-box', position: 'relative' }}>
                        <img src={allImages[currentImageIndex]} alt={`${car.brand} ${car.name}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', transition: 'opacity 0.2s ease' }} />

                        {allImages.length > 1 && (
                            <>
                                <button onClick={prevImage} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button onClick={nextImage} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>

                                <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                                    {allImages.map((_, idx) => (
                                        <div key={idx} onClick={() => setCurrentImageIndex(idx)} style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentImageIndex === idx ? '#ffffff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background 0.2s ease' }} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ width: '60%', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.3rem', fontSize: '0.75rem' }}>{car.brand}</div>
                                <h1 style={{ fontSize: '1.3rem', margin: 0, lineHeight: 1.2, color: '#0f172a', fontWeight: 700, letterSpacing: '-0.5px' }}>{car.name}</h1>
                            </div>
                            <div style={{ textAlign: 'right', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>₹{car.price_per_day?.toLocaleString()}</div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>per day</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.8rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    Year
                                </strong>
                                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{car.model_year}</span>
                            </div>
                            <div style={{ padding: '0.8rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    Transmission
                                </strong>
                                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{car.transmission}</span>
                            </div>
                            <div style={{ padding: '0.8rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="15" y2="22"></line><line x1="4" y1="9" x2="14" y2="9"></line><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path></svg>
                                    Fuel Type
                                </strong>
                                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{car.fuel_type}</span>
                            </div>
                            <div style={{ padding: '0.8rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    Seats
                                </strong>
                                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{car.seating_capacity}</span>
                            </div>
                            <div style={{ padding: '0.8rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', marginBottom: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    Status
                                </strong>
                                <span style={{
                                    padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, display: 'inline-block',
                                    background: car.availability_status === 'Available' ? '#ecfdf5' : '#fef2f2',
                                    color: car.availability_status === 'Available' ? '#059669' : '#dc2626',
                                    border: `1px solid ${car.availability_status === 'Available' ? '#d1fae5' : '#fee2e2'}`,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {car.availability_status === 'Available' ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <h3 style={{ flexShrink: 0, marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>Overview</h3>
                            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                <p style={{ lineHeight: '1.6', color: '#475569', fontSize: '0.85rem', margin: 0 }}>{car.description || 'A stunning premium vehicle awaiting your test drive.'}</p>
                            </div>
                        </div>

                        <button
                            className="btn"
                            style={{ flexShrink: 0, width: '100%', fontSize: '0.95rem', padding: '0.8rem', background: '#4A6572', color: '#ffffff', borderRadius: '10px', fontWeight: 600, letterSpacing: '0.5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '1rem' }}
                            onClick={() => setShowModal(true)}
                            disabled={car.availability_status !== 'Available'}
                        >
                            {car.availability_status === 'Available' ? 'Book This Vehicle' : 'Currently Unavailable'}
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '440px', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Complete Booking</h2>
                        <p style={{ color: '#64748b', margin: '0 0 2rem 0', fontSize: '0.85rem', lineHeight: 1.5 }}>To request the <strong style={{ color: '#0f172a' }}>{car.brand} {car.name}</strong>, please enter your contact details below. We'll reach out shortly.</p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={bookingName}
                                onChange={(e) => setBookingName(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Phone Number / Email</label>
                            <input
                                type="text"
                                placeholder="e.g. +91 98765 43210"
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleBook} className="btn" style={{ flex: 2, background: '#4A6572', color: '#ffffff', border: 'none', fontWeight: 600 }} disabled={!bookingName.trim()}>Submit Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;
