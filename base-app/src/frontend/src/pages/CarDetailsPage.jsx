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
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div>
                                <div style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.3rem', fontSize: '0.9rem' }}>{car.brand}</div>
                                <h1 style={{ fontSize: '1.8rem', margin: '0 0 1rem 0', lineHeight: 1.2, color: '#0f172a', fontWeight: 700 }}>{car.name}</h1>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>₹{car.price_per_day?.toLocaleString()}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Ex-showroom</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                            <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>{car.range || 'N/A'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Range</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.64A1 1 0 0012.5 7H7.5a1 1 0 00-.8.4L4 11l-2 1.15V16h3m8 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"></path></svg>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>{car.body_type || 'N/A'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Body type</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>{car.fuel_type || 'N/A'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fuel type</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <h3 style={{ flexShrink: 0, marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>Overview</h3>
                            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                <p style={{ lineHeight: '1.6', color: '#475569', fontSize: '0.85rem', margin: 0 }}>{car.description || 'A stunning premium vehicle awaiting your test drive.'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.8rem', background: '#0a0a0a', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: car.availability_status !== 'Available' ? 0.7 : 1 }}
                                onClick={() => setShowModal(true)}
                                disabled={car.availability_status !== 'Available'}
                            >
                                {car.availability_status === 'Available' ? 'Grab hot deals' : 'Currently Unavailable'}
                            </button>
                        </div>
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
