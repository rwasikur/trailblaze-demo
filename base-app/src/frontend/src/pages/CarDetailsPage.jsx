import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { SearchX } from 'lucide-react';
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

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading details...</p>;
    if (!car) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 84px)', color: '#334155', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', margin: '-2rem -5.5% -2rem -5.5%' }}>
                <div style={{ background: '#ffffff', padding: '3rem 4rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                        <SearchX size={48} color="#64748b" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Car Not Found</h2>
                    <p style={{ color: '#64748b', margin: '0 0 2rem 0', maxWidth: '350px', lineHeight: 1.5 }}>
                        We couldn't find the vehicle you're looking for. It may have been sold, removed, or the link might be broken.
                    </p>
                    <button
                        onClick={() => navigate('/browse')}
                        style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                        onMouseOver={(e) => e.target.style.background = '#334155'}
                        onMouseOut={(e) => e.target.style.background = '#0f172a'}
                    >
                        Browse Catalogue
                    </button>
                </div>
            </div>
        );
    }

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <button onClick={() => navigate(-1)} className="btn" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderRadius: '8px', padding: '0.4rem 1rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                        &larr; Back to Catalogue
                    </button>
                </div>

                {/* Sub-Navigation Tabs */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 1.5rem', marginBottom: '1.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '2rem', overflowX: 'auto', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    {[
                        { id: 'Overview', label: `${car.brand} ${car.name}` },
                        { id: 'Price', label: 'Price' },
                        { id: 'Specs', label: 'Specs' },
                        { id: 'Colours', label: 'Colours' },
                        { id: 'Range', label: 'Range' },
                        { id: 'Images', label: 'Images' }
                    ].map((tab, idx) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1rem 0',
                                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                fontSize: idx === 0 ? '1.05rem' : '1rem',
                                borderRight: idx === 0 ? '1px solid #e2e8f0' : 'none',
                                paddingRight: idx === 0 ? '2rem' : '0',
                                cursor: 'pointer',
                                borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
                    {activeTab !== 'Images' && (
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
                    )}

                    <div style={{ width: activeTab === 'Images' ? '100%' : '60%', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        {activeTab === 'Overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                <div>
                                    <div style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.3rem', fontSize: '0.9rem' }}>{car.brand}</div>
                                    <h1 style={{ fontSize: '1.8rem', margin: '0 0 1rem 0', lineHeight: 1.2, color: '#0f172a', fontWeight: 700 }}>{car.name}</h1>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>${car.price_per_day?.toLocaleString()}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Ex-showroom</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f172a' }}>
                                        {car.seller_name ? car.seller_name.charAt(0).toUpperCase() : 'T'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.1rem' }}>Sold by</div>
                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{car.seller_name || 'TrailblazeAuto Dealership'}</div>
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
                            </div>
                        )}

                        {activeTab !== 'Overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                {activeTab === 'Specs' && (
                                    <>
                                        <h3 style={{ flexShrink: 0, marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>Vehicle Specifications</h3>
                                        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Mileage</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.mileage || 'N/A'}</div></div>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Transmission</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.transmission || 'N/A'}</div></div>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Number of Owners</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.number_of_owners || 'N/A'}</div></div>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Registration City</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.registration_city || 'N/A'}</div></div>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Insurance Validity</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.insurance_validity || 'N/A'}</div></div>
                                                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Seating Capacity</span><div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{car.seating_capacity ? `${car.seating_capacity} Seats` : 'N/A'}</div></div>
                                            </div>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>Description</h4>
                                            <p style={{ lineHeight: '1.6', color: '#475569', fontSize: '0.85rem', margin: 0, paddingBottom: '1rem' }}>{car.description || 'Currently details not available.'}</p>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Price' && (
                                    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>Price Breakdown</h3>
                                        {car.price_per_day ? (
                                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: '#64748b' }}>Ex-Showroom Price</span>
                                                    <span style={{ fontWeight: 600 }}>${car.price_per_day.toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                                    <span style={{ color: '#64748b' }}>Estimated Registration & Insurance</span>
                                                    <span style={{ fontWeight: 600, color: '#94a3b8' }}>Varies by City</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Estimated On-Road</span>
                                                    <span style={{ fontWeight: 700, color: '#059669' }}>Request Final Quote</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Currently details not available.</p>
                                        )}
                                    </div>
                                )}



                                {activeTab === 'Colours' && (
                                    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>Available Colours</h3>
                                        {car.exterior_color || car.interior_color ? (
                                            <>
                                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                                    <div><span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Exterior Color</span><div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{car.exterior_color || 'N/A'}</div></div>
                                                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}><span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Interior Color</span><div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{car.interior_color || 'N/A'}</div></div>
                                                </div>
                                                <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem' }}>Ask us about customizing your order if you are looking for a specific interior or exterior finish.</p>
                                            </>
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Currently details not available.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Range' && (
                                    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: '#0f172a', fontWeight: 700 }}>Range & Performance</h3>
                                        {car.range ? (
                                            <div style={{ background: '#f8fafc', padding: '2rem 1.5rem', borderRadius: '8px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4A6572', marginBottom: '0.5rem' }}>{car.range}</div>
                                                <div style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>Estimated Range / Fuel Efficiency</div>
                                                <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>*Actual range may vary based on driving conditions and environment.</p>
                                            </div>
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Currently details not available.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Images' && (
                                    <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                                        {allImages.length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                                                {allImages.map((img, idx) => (
                                                    <div key={idx} onClick={() => setFullScreenImage(img)} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', cursor: 'zoom-in' }}>
                                                        <img src={img} alt={`View ${idx + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Currently details not available.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {localStorage.getItem('adminToken') ? (
                                <button
                                    className="btn"
                                    style={{ flex: 1, padding: '0.8rem', background: '#0a0a0a', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                                    onClick={() => navigate(`/admin/edit-car/${car._id}`)}
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    style={{ flex: 1, padding: '0.8rem', background: '#0a0a0a', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: car.availability_status !== 'Available' ? 0.7 : 1 }}
                                    onClick={() => setShowModal(true)}
                                    disabled={car.availability_status !== 'Available'}
                                >
                                    {car.availability_status === 'Available' ? 'Book Now' : 'Currently Unavailable'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {fullScreenImage && (
                <div onClick={() => setFullScreenImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
                    <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '1.5rem', right: '2rem', background: 'transparent', border: 'none', color: '#ffffff', fontSize: '2.5rem', cursor: 'pointer', zIndex: 1101, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)', transition: 'background-color 0.2s ease' }}>&times;</button>
                    <img src={fullScreenImage} alt="Maximized View" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()} />
                </div>
            )}

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
