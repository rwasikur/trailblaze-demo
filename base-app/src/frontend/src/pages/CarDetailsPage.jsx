import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';

const CarDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Overview');
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

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

        // Task 4: Track Recently Viewed
        if (id) {
            try {
                const rawRecent = localStorage.getItem('recentCars');
                let recent = JSON.parse(rawRecent || '[]');

                // Filter out existing to ensure current visit is #1 (most recent)
                recent = [id, ...recent.filter(item => item !== id)].slice(0, 5);

                localStorage.setItem('recentCars', JSON.stringify(recent));

                // Notify other components in the same tab
                window.dispatchEvent(new Event('recentCarsUpdated'));
            } catch (e) {
                console.error('Error tracking visit', e);
                localStorage.setItem('recentCars', JSON.stringify([id]));
                window.dispatchEvent(new Event('recentCarsUpdated'));
            }
        }
    }, [id]);

    if (loading) return (
        <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_35%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex justify-between items-center">
                    <Button id="back-to-catalogue" variant="outline" onClick={() => navigate(-1)} className="text-sm">
                        &larr; Back to Catalogue
                    </Button>
                </div>
                <div className="flex justify-center mt-12"><p className="text-slate-500 font-medium animate-pulse">Loading details...</p></div>
            </div>
        </div>
    );
    if (!car) return (
        <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_35%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex justify-between items-center">
                    <Button id="back-to-catalogue" variant="outline" onClick={() => navigate(-1)} className="text-sm">
                        &larr; Back to Catalogue
                    </Button>
                </div>
                <div className="flex justify-center mt-12"><p className="text-slate-500 font-medium">Car not found.</p></div>
            </div>
        </div>
    );

    const allImages = [car.image_url || '/car3.avif'];
    if (car.secondary_images && Array.isArray(car.secondary_images)) {
        allImages.push(...car.secondary_images);
    }

    const nextImage = () => {
        setImageLoaded(false);
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };
    const prevImage = () => {
        setImageLoaded(false);
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const tabs = [
        { id: 'Overview', label: `${car.brand} ${car.name}` },
        { id: 'Price', label: 'Price' },
        { id: 'Specs', label: 'Specs' },
        { id: 'Colours', label: 'Colours' },
        { id: 'Range', label: 'Range' },
        { id: 'Images', label: 'Images' },
    ];

    return (
        <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_35%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex justify-between items-center">
                    <Button id="back-to-catalogue" variant="outline" onClick={() => navigate(-1)} className="text-sm">
                        &larr; Back to Catalogue
                    </Button>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="bg-white border border-slate-200 rounded-2xl px-6 flex items-center gap-8 overflow-x-auto whitespace-nowrap shadow-sm no-scrollbar">
                    {tabs.map((tab, idx) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 cursor-pointer transition-all duration-200 border-b-2 font-medium ${activeTab === tab.id
                                ? 'border-slate-900 text-slate-900 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                } ${idx === 0 ? 'pr-8 border-r border-r-slate-200 text-[1.05rem]' : 'text-base'}`}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col md:flex-row">
                    {activeTab !== 'Images' && (
                        <div className="w-full md:w-[45%] bg-[linear-gradient(180deg,#e2e8f0_0%,#cbd5e1_100%)] flex flex-col items-center justify-center p-8 relative min-h-[360px]">
                            <img
                                id={imageLoaded ? "car-detail-image" : undefined}
                                src={allImages[currentImageIndex]}
                                alt={`${car.brand} ${car.name}`}
                                onLoad={() => setImageLoaded(true)}
                                className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 hidden'}`}
                            />
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-md z-10 transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-md z-10 transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                    <div className="absolute bottom-4 flex gap-2 bg-slate-900/40 px-3 py-1.5 rounded-full">
                                        {allImages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className={`${activeTab === 'Images' ? 'w-full' : 'w-full md:w-[55%]'} p-6 md:p-10 flex flex-col`}>
                        {activeTab === 'Overview' && (
                            <div className="flex flex-col">
                                <div>
                                    <div id="car-detail-brand" className="text-slate-500 font-medium mb-1 text-sm">{car.brand}</div>
                                    <h1 id="car-detail-name" className="text-3xl md:text-4xl m-0 mb-4 font-display font-bold text-slate-900 leading-tight">{car.name}</h1>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div id="car-detail-price" className="text-2xl text-accent font-bold">${car.price_per_day?.toLocaleString()}</div>
                                        <div className="text-slate-500 text-xs mt-0.5 tracking-wide uppercase">Ex-showroom</div>
                                    </div>
                                </div>

                                <div className="mb-6 p-4 border border-slate-200 rounded-2xl bg-slate-50 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg">
                                        {car.seller_name ? car.seller_name.charAt(0).toUpperCase() : 'T'}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Sold by</div>
                                        <div className="font-semibold text-slate-900 text-base">{car.seller_name || 'TrailblazeAuto Dealership'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-8 pb-6 border-b border-t border-slate-200 pt-6 sm:grid-cols-3">
                                    <div className="text-center flex-1 sm:border-r border-slate-200">
                                        <div className="mb-2 flex justify-center text-slate-400">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        </div>
                                        <div className="text-base font-semibold text-slate-900 mb-0.5">{car.range || 'N/A'}</div>
                                        <div className="text-xs text-slate-500">Range</div>
                                    </div>
                                    <div className="text-center flex-1 sm:border-r border-slate-200">
                                        <div className="mb-2 flex justify-center text-slate-400">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.64A1 1 0 0012.5 7H7.5a1 1 0 00-.8.4L4 11l-2 1.15V16h3m8 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"></path></svg>
                                        </div>
                                        <div className="text-base font-semibold text-slate-900 mb-0.5">{car.body_type || 'N/A'}</div>
                                        <div className="text-xs text-slate-500">Body type</div>
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="mb-2 flex justify-center text-slate-400">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                        </div>
                                        <div id="car-detail-fuel" className="text-base font-semibold text-slate-900 mb-0.5">{car.fuel_type || 'N/A'}</div>
                                        <div className="text-xs text-slate-500">Fuel type</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'Overview' && (
                            <div className="flex flex-col pr-2">
                                {activeTab === 'Specs' && (
                                    <>
                                        <h3 className="shrink-0 mb-4 border-b border-slate-100 pb-2 text-slate-900 font-bold text-lg">Vehicle Specifications</h3>
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <div><span className="text-slate-500 text-xs block mb-1">Mileage</span><div className="text-sm font-semibold text-slate-900">{car.mileage || 'N/A'}</div></div>
                                                <div><span className="text-slate-500 text-xs block mb-1">Transmission</span><div className="text-sm font-semibold text-slate-900">{car.transmission || 'N/A'}</div></div>
                                                <div><span className="text-slate-500 text-xs block mb-1">Number of Owners</span><div className="text-sm font-semibold text-slate-900">{car.number_of_owners || 'N/A'}</div></div>
                                                <div><span className="text-slate-500 text-xs block mb-1">Registration City</span><div className="text-sm font-semibold text-slate-900">{car.registration_city || 'N/A'}</div></div>
                                                <div><span className="text-slate-500 text-xs block mb-1">Insurance Validity</span><div className="text-sm font-semibold text-slate-900">{car.insurance_validity || 'N/A'}</div></div>
                                                <div><span className="text-slate-500 text-xs block mb-1">Seating Capacity</span><div className="text-sm font-semibold text-slate-900">{car.seating_capacity ? `${car.seating_capacity} Seats` : 'N/A'}</div></div>
                                            </div>
                                            <h4 className="text-base font-bold m-0 mb-2 text-slate-900">Description</h4>
                                            <div className="leading-relaxed text-slate-600 text-sm mb-0 pb-4"
                                                dangerouslySetInnerHTML={{ __html: car.description || 'Currently details not available.' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'Price' && (
                                    <div className="flex-1">
                                        <h3 className="mb-4 text-slate-900 font-bold text-lg">Price Breakdown</h3>
                                        {car.price_per_day ? (
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600 text-sm">Ex-Showroom Price</span>
                                                    <span className="font-semibold text-slate-900">${car.price_per_day.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-200 pb-3">
                                                    <span className="text-slate-600 text-sm">Estimated Registration & Insurance</span>
                                                    <span className="font-semibold text-slate-400 text-sm">Varies by City</span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span className="font-bold text-slate-900 text-base">Estimated Vehicle Price</span>
                                                    <span className="font-bold text-emerald-600 text-lg">${car.price_per_day.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">Currently details not available.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Colours' && (
                                    <div className="flex-1">
                                        <h3 className="mb-4 text-slate-900 font-bold text-lg">Available Colours</h3>
                                        {car.exterior_color || car.interior_color ? (
                                            <>
                                                <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 sm:items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <div><span className="text-slate-500 text-xs block mb-1">Exterior Color</span><div className="text-base font-semibold text-slate-900">{car.exterior_color || 'N/A'}</div></div>
                                                    <div className="sm:border-l border-slate-200 sm:pl-8"><span className="text-slate-500 text-xs block mb-1">Interior Color</span><div className="text-base font-semibold text-slate-900">{car.interior_color || 'N/A'}</div></div>
                                                </div>
                                                <p className="mt-4 text-slate-500 text-sm">Ask us about customizing your order if you are looking for a specific interior or exterior finish.</p>
                                            </>
                                        ) : (
                                            <p className="text-slate-500 text-sm">Currently details not available.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Range' && (
                                    <div className="flex-1">
                                        <h3 className="mb-4 text-slate-900 font-bold text-lg">Range & Performance</h3>
                                        {car.range ? (
                                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                                                <div className="text-5xl font-extrabold text-accent mb-3">{car.range}</div>
                                                <div className="text-slate-600 text-base font-semibold">Estimated Range / Fuel Efficiency</div>
                                                <p className="mt-4 text-xs text-slate-400">*Actual range may vary based on driving conditions and environment.</p>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">Currently details not available.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'Images' && (
                                    <div className="flex-1">
                                        {allImages.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {allImages.map((img, idx) => (
                                                    <div key={idx} onClick={() => setFullScreenImage(img)} className="rounded-2xl overflow-hidden border border-slate-200 relative cursor-zoom-in aspect-square group">
                                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">Currently details not available.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-6">
                            {localStorage.getItem('adminToken') && (
                                <Button
                                    className="flex-1 mt-auto"
                                    onClick={() => navigate(`/admin/edit-car/${car._id}`)}
                                >
                                    Edit Details
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {fullScreenImage && (
                <div onClick={() => setFullScreenImage(null)} className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[1100] p-4">
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors">&times;</button>
                    <img src={fullScreenImage} alt="Maximized View" className="max-w-[90%] max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;
