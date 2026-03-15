import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, X, Fuel, Users, Gauge, Settings, MapPin, Shield, Calendar, SearchX } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('Overview');
    const [fullScreenImage, setFullScreenImage] = useState(null);

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

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
            Loading details...
        </div>
    );

    if (!car) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 84px)', color: 'var(--text-main)', fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--bg-color)', margin: '-2rem -5.5% -2rem -5.5%' }}>
                <div style={{ background: 'var(--surface)', padding: '3rem 4rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <SearchX size={48} color="var(--text-muted)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontFamily: "'Syne', sans-serif" }}>Car Not Found</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem 0', maxWidth: '350px', lineHeight: 1.5, fontSize: '0.9rem' }}>
                        We couldn't find the vehicle you're looking for. It may have been sold, removed, or the link might be broken.
                    </p>
                    <button
                        onClick={() => navigate('/browse')}
                        className="btn btn-slate"
                        style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}
                    >
                        Browse Catalogue
                    </button>
                </div>
            </div>
        );
    }

    const formatUrl = (url) => {
        if (!url) return '/car3.avif';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL || ''}${url}`;
    };

    const allImages = [formatUrl(car.image_url)];
    if (car.secondary_images && Array.isArray(car.secondary_images)) {
        car.secondary_images.forEach(img => {
            allImages.push(formatUrl(img));
        });
    }

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

    const tabs = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Specs', label: 'Specs' },
        { id: 'Price', label: 'Price' },
        { id: 'Colours', label: 'Colours' },
        { id: 'Range', label: 'Range' },
        { id: 'Images', label: 'Images' },
    ];

    const isAvailable = car.availability_status === 'Available';

    return (
        <div style={{
            backgroundColor: 'var(--bg-color)',
            minHeight: 'calc(100vh - 84px)',
            padding: '1.25rem 3%',
            fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text-main)',
            boxSizing: 'border-box'
        }}>
            <div style={{ maxWidth: '1350px', margin: '0 auto' }}>

                {/* ── TOP BAR ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--surface)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-muted)', borderRadius: '8px',
                            padding: '0.45rem 1rem', fontSize: '0.85rem',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                    >
                        <ArrowLeft size={15} /> Back to Catalogue
                    </button>
                    <button
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--surface)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-muted)', borderRadius: '8px',
                            padding: '0.45rem 1rem', fontSize: '0.85rem',
                            fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        <Share2 size={14} /> Share
                    </button>
                </div>

                {/* ── TAB BAR ── */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '0 1.25rem',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {/* Car name — left anchor */}
                    <div style={{
                        padding: '0.9rem 1.25rem 0.9rem 0',
                        marginRight: '1.25rem',
                        borderRight: '1px solid var(--glass-border)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.98rem',
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}>
                        {car.brand} {car.name}
                    </div>

                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.9rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── MAIN CONTENT CARD ── */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row',
                    minHeight: '400px'
                }}>
                    {/* ── LEFT: Image Panel ── */}
                    {activeTab !== 'Images' && (
                        <div style={{
                            width: '42%',
                            background: 'linear-gradient(160deg, #0f1923 0%, #1a2d3e 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            <img
                                src={allImages[currentImageIndex]}
                                alt={`${car.brand} ${car.name}`}
                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', transition: 'opacity 0.2s ease' }}
                            />

                            {allImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} style={{
                                        position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                                        borderRadius: '50%', width: '36px', height: '36px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--text-main)', zIndex: 10, transition: 'background 0.2s'
                                    }}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={nextImage} style={{
                                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                                        borderRadius: '50%', width: '36px', height: '36px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--text-main)', zIndex: 10, transition: 'background 0.2s'
                                    }}>
                                        <ChevronRight size={18} />
                                    </button>

                                    {/* Dot indicators */}
                                    <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', gap: '6px' }}>
                                        {allImages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                style={{
                                                    width: currentImageIndex === idx ? '20px' : '8px',
                                                    height: '8px', borderRadius: '4px',
                                                    background: currentImageIndex === idx ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                                                    cursor: 'pointer', transition: 'all 0.25s'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Availability badge on image */}
                            <div style={{
                                position: 'absolute', top: '0.75rem', left: '0.75rem',
                                padding: '0.2rem 0.6rem', borderRadius: '100px',
                                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                                background: isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: isAvailable ? '#4ade80' : '#f87171'
                            }}>
                                {car.availability_status || 'Available'}
                            </div>
                        </div>
                    )}

                    {/* ── RIGHT: Content Panel ── */}
                    <div style={{
                        flex: 1,
                        padding: '1.25rem 1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                    }}>

                        {/* ── OVERVIEW TAB ── */}
                        {activeTab === 'Overview' && (
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                        {car.brand}
                                    </div>
                                    <h1 style={{ fontSize: '1.7rem', margin: '0 0 0.2rem', lineHeight: 1.15, color: 'var(--text-main)', fontWeight: 900, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}>
                                        {car.name}
                                    </h1>
                                    {car.category && (
                                        <span style={{ display: 'inline-block', padding: '0.2rem 0.7rem', background: 'rgba(58,123,213,0.12)', border: '1px solid rgba(58,123,213,0.25)', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                                            {car.category}
                                        </span>
                                    )}
                                </div>

                                {/* Seller info snippet */}
                                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                                        {car.seller_name ? car.seller_name.charAt(0).toUpperCase() : 'T'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.05rem' }}>Sold by</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{car.seller_name || 'TrailblazeAuto Dealership'}</div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-1px' }}>
                                        ${car.price_per_day?.toLocaleString()}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>Ex-showroom price</div>
                                </div>

                                {/* Quick specs row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                                    {[
                                        { icon: <Gauge size={16} />, label: 'Range', value: car.range || 'N/A' },
                                        { icon: <Settings size={16} />, label: 'Body Type', value: car.body_type || 'N/A' },
                                        { icon: <Fuel size={16} />, label: 'Fuel', value: car.fuel_type || 'N/A' },
                                    ].map((spec, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '10px',
                                            padding: '0.75rem 0.5rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ color: 'var(--accent-light)', marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{spec.icon}</div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.1rem' }}>{spec.value}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{spec.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Description snippet */}
                                {car.description && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                        {car.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── SPECS TAB ── */}
                        {activeTab === 'Specs' && (
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                                    Vehicle Specifications
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Mileage', value: car.mileage },
                                        { label: 'Transmission', value: car.transmission },
                                        { label: 'Number of Owners', value: car.number_of_owners },
                                        { label: 'Registration City', value: car.registration_city },
                                        { label: 'Insurance Validity', value: car.insurance_validity },
                                        { label: 'Seating Capacity', value: car.seating_capacity ? `${car.seating_capacity} Seats` : null },
                                        { label: 'Body Type', value: car.body_type },
                                        { label: 'Fuel Type', value: car.fuel_type },
                                    ].map((spec, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.025)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '10px', padding: '0.9rem 1rem'
                                        }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.3rem' }}>{spec.label}</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>{spec.value || 'N/A'}</div>
                                        </div>
                                    ))}
                                </div>
                                {car.description && (
                                    <>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>Description</h4>
                                        <p style={{ lineHeight: 1.7, color: 'var(--text-muted)', fontSize: '0.88rem' }}>{car.description}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── PRICE TAB ── */}
                        {activeTab === 'Price' && (
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                                    Price Breakdown
                                </h3>
                                {car.price_per_day ? (
                                    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                                        {[
                                            { label: 'Ex-Showroom Price', value: `$${car.price_per_day.toLocaleString()}` },
                                            { label: 'Estimated Registration & Insurance', value: 'Varies by City' },
                                        ].map((row, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{row.value}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: 'rgba(58,123,213,0.06)' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: "'DM Sans', sans-serif" }}>Estimated On-Road</span>
                                            <span style={{ fontWeight: 800, color: 'var(--accent-light)' }}>Request Final Quote</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Price details not available.</p>
                                )}
                            </div>
                        )}

                        {/* ── COLOURS TAB ── */}
                        {activeTab === 'Colours' && (
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                                    Available Colours
                                </h3>
                                {car.exterior_color || car.interior_color ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                            {[
                                                { label: 'Exterior Color', value: car.exterior_color },
                                                { label: 'Interior Color', value: car.interior_color },
                                            ].map((c, i) => (
                                                <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem' }}>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.4rem' }}>{c.label}</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.value || 'N/A'}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                            Ask us about customizing your order if you are looking for a specific interior or exterior finish.
                                        </p>
                                    </>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Colour details not available.</p>
                                )}
                            </div>
                        )}

                        {/* ── RANGE TAB ── */}
                        {activeTab === 'Range' && (
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                                    Range & Performance
                                </h3>
                                {car.range ? (
                                    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-light)', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-1px' }}>
                                            {car.range}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Estimated Range / Fuel Efficiency</div>
                                        <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                                            *Actual range may vary based on driving conditions and environment.
                                        </p>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Range details not available.</p>
                                )}
                            </div>
                        )}

                        {/* ── IMAGES TAB (full width) ── */}
                        {activeTab === 'Images' && (
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                                    Photo Gallery
                                </h3>
                                {allImages.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
                                        {allImages.map((img, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setFullScreenImage(img)}
                                                style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)', cursor: 'zoom-in', transition: 'transform 0.2s, border-color 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(58,123,213,0.4)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                                            >
                                                <img src={img} alt={`View ${idx + 1}`} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>No images available.</p>
                                )}
                            </div>
                        )}

                        {/* ── ACTION BUTTONS ── */}
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem' }}>
                            {localStorage.getItem('adminToken') ? (
                                <button
                                    className="btn btn-slate"
                                    style={{ flex: 1, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }}
                                    onClick={() => navigate(`/admin/edit-car/${car._id}`)}
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    style={{
                                        flex: 1, padding: '0.9rem',
                                        fontSize: '0.95rem', fontWeight: 700,
                                        borderRadius: '10px',
                                        background: isAvailable ? 'var(--accent)' : 'var(--surface-raised)',
                                        color: isAvailable ? '#fff' : 'var(--text-muted)',
                                        border: isAvailable ? 'none' : '1px solid var(--glass-border)',
                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                        opacity: isAvailable ? 1 : 0.7,
                                        boxShadow: isAvailable ? '0 8px 24px var(--accent-glow)' : 'none',
                                        transition: 'all 0.3s'
                                    }}
                                    onClick={() => isAvailable && setShowModal(true)}
                                    disabled={!isAvailable}
                                >
                                    {isAvailable ? 'Request a Booking' : 'Currently Unavailable'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FULLSCREEN IMAGE MODAL ── */}
            {fullScreenImage && (
                <div
                    onClick={() => setFullScreenImage(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}
                >
                    <button
                        onClick={() => setFullScreenImage(null)}
                        style={{
                            position: 'absolute', top: '1.5rem', right: '2rem',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff', width: '42px', height: '42px',
                            borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1101
                        }}
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={formatUrl(fullScreenImage)}
                        alt="Full View"
                        style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* ── BOOKING MODAL ── */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '90%', maxWidth: '440px',
                            background: 'var(--surface)',
                            border: '1px solid var(--glass-border)',
                            padding: '2rem', borderRadius: '18px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: '0 0 0.4rem', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                                Request a Booking
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                                Enquiring about the <strong style={{ color: 'var(--text-main)' }}>{car.brand} {car.name}</strong>. Enter your details and we'll reach out shortly.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                value={bookingName}
                                onChange={(e) => setBookingName(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    borderRadius: '10px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)',
                                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.93rem', outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Phone Number / Email
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. +91 98765 43210"
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    borderRadius: '10px', border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)',
                                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.93rem', outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1, padding: '0.8rem',
                                    background: 'transparent', color: 'var(--text-muted)',
                                    border: '1px solid var(--glass-border)', borderRadius: '100px',
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                                    fontSize: '0.9rem', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBook}
                                disabled={!bookingName.trim()}
                                style={{
                                    flex: 2, padding: '0.8rem',
                                    background: bookingName.trim() ? 'var(--accent)' : 'var(--surface-raised)',
                                    color: bookingName.trim() ? '#fff' : 'var(--text-muted)',
                                    border: 'none', borderRadius: '100px',
                                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                                    fontSize: '0.9rem', cursor: bookingName.trim() ? 'pointer' : 'not-allowed',
                                    boxShadow: bookingName.trim() ? '0 4px 16px var(--accent-glow)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;