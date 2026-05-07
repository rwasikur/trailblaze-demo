import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';
import PurchaseModal from '../components/PurchaseModal';
import { getColorCode } from '../constants/colorMapping';

const CarDetailsPage = () => {


    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('Overview');
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

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
                        &larr; Back to Fleet
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
                        &larr; Back to Fleet
                    </Button>
                </div>
                <div className="flex justify-center mt-12"><p className="text-slate-500 font-medium">Vehicle Not Found</p></div>
            </div>
        </div>
    );

    const allImages = [car.image_url || '/car3.avif'];
    if (car.secondary_images && Array.isArray(car.secondary_images)) {
        allImages.push(...car.secondary_images);
    }

    const tabs = ['Overview', 'Price', 'Specs', 'Images'];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Price':
                if (car.condition === 'Used') {
                    let originalPrice;
                    if (car.past_owners && car.past_owners.length > 0) {
                        const sortedHistory = [...car.past_owners].sort((a, b) => new Date(a.sale_date) - new Date(b.sale_date));
                        console.log(sortedHistory, "sortedHistory");
                        originalPrice = sortedHistory[0].sale_price || sortedHistory[0].price || car.price;
                    } else {
                        const depreciationFactor = Math.min((car.number_of_owners || 1) * 0.15, 0.7);
                        originalPrice = Math.round(car.price / (1 - depreciationFactor));
                    }
                    console.log(originalPrice, "originalPrice");
                    // if (typeof originalPrice !== 'number' || isNaN(originalPrice)) {
                    //     originalPrice = car.price || 0;
                    // }
                    console.log(originalPrice, "originalPrice");
                    const depreciationAmount = originalPrice - (car.price || 0);
                    console.log(depreciationAmount, "depreciationAmount");
                    return (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h3>
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-bold">Original Ex-Showroom</span>
                                    <span className="text-lg font-bold text-slate-400 line-through">${originalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-bold">Owner Depreciation ({car.number_of_owners} Owners)</span>
                                    <span className="text-red-500 text-sm font-bold">- ${depreciationAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-bold">Estimated Registration</span>
                                    <span className="text-slate-900 text-sm font-bold">Varies by City</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-blue-600 font-black uppercase tracking-tighter text-xl">Current Valuation</span>
                                    <span className="text-4xl font-black text-blue-600">${car.price?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h3>
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-bold">Ex-Showroom Price</span>
                                    <span className="text-2xl font-black text-slate-900">${car.price?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 text-sm font-bold">Estimated Registration</span>
                                    <span className="text-slate-900 text-sm font-bold">Varies by City</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-blue-600 font-black uppercase tracking-tighter text-xl">Valuation</span>
                                    <span className="text-4xl font-black text-blue-600">${car.price?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                }
            case 'Specs':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Technical Specifications</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {(() => {
                                    const specs = [
                                        { l: 'mileage', v: car.mileage || 'N/A' },
                                        { l: 'Transmission', v: car.transmission }
                                    ];

                                    if (car.condition === 'Used') {
                                        specs.push({ l: 'Distance Covered', v: car.total_distance_covered || 'N/A' });
                                        specs.push({ l: 'City Hub', v: car.registration_city || 'N/A' });
                                        specs.push({ l: 'Prev Owners', v: car.number_of_owners?.toString() || '1' });

                                        let validityStatus = car.insurance_validity || 'Valid';
                                        if (car.insurance_validity) {
                                            const expiryDate = new Date(car.insurance_validity);
                                            if (!isNaN(expiryDate) && expiryDate < new Date()) {
                                                validityStatus = <span className="text-red-600">Expired</span>;
                                            }
                                        }
                                        specs.push({ l: 'Insurance Validity', v: validityStatus });
                                    } else {
                                        specs.push({ l: 'Condition', v: 'Brand New' });
                                    }

                                    specs.push({ l: 'Seating', v: `${car.seating_capacity} Seats` });

                                    return specs.map((s, i) => (
                                        <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{s.l}</div>
                                            <div className="text-base font-black text-slate-900">{s.v}</div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {car.condition === 'New' && (
                            <div className="pt-2">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Available Palettes</h3>
                                <div className="flex flex-wrap gap-4">
                                    {car.available_colors && car.available_colors.map((color, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 min-w-[140px]">
                                            <div className="w-8 h-8 rounded-lg shadow-inner border-2 border-white" style={{ backgroundColor: getColorCode(color) }}></div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Color Option</div>
                                                <div className="text-sm font-black text-slate-900">{color}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{car.description || 'No additional description provided.'}</p>
                        </div>
                    </div>
                );
            case 'Images':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Media Gallery</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {allImages.map((img, idx) => (
                                <div key={idx} className="relative group aspect-video overflow-hidden rounded-xl border border-slate-200 cursor-zoom-in" onClick={() => setFullScreenImage(img)}>
                                    <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: // Overview
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">{car.brand}</div>
                            <h1 id="car-detail-name" className="text-4xl font-black text-slate-900 tracking-tight leading-none">{car.name}</h1>
                            <div className="mt-3 flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${car.condition === 'New' ? 'bg-blue-600 text-white border-blue-600' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                    {car.condition === 'New' ? 'Brand New' : 'Certified'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Acquisition</div>
                                    <div className="text-4xl font-black tracking-tight">${car.price?.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Official Seller</div>
                                    <div className="text-base font-bold">{car.seller_name || 'Trailblaze HQ'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System</div>
                                <div className="font-black text-slate-900 text-sm">{car.fuel_type}</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class</div>
                                <div className="font-black text-slate-900 text-sm">{car.body_type || 'GT'}</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Seating</div>
                                <div className="font-black text-blue-600 text-sm">{car.seating_capacity} Seats</div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-full bg-slate-50 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between gap-8">
                    {/* Left: Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 flex items-center gap-3 group transition-all shrink-0"
                    >
                        <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">←</span>
                        Back
                    </button>

                    {/* Center: Tab Navigation */}
                    <div className="bg-white/70 backdrop-blur-md rounded-full p-1 flex gap-1 border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-950 text-white shadow-md' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Right: Action Button */}
                    <button
                        id="book-now-main-button"
                        onClick={() => car.availability_status === 'Available' && setIsPurchaseModalOpen(true)}
                        disabled={car.availability_status !== 'Available'}
                        className={`h-10 px-8 rounded-full font-black uppercase tracking-[0.2em] text-[11px] transition-all shrink-0 ${car.availability_status === 'Available'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                            }`}
                    >
                        {car.availability_status === 'Available' ? 'Book Now' : 'Sold Out'}
                    </button>
                </div>

                {/* Master Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden grid lg:grid-cols-[1fr_0.8fr] h-[540px] max-h-[70vh]">

                    {/* Left: Dynamic Visuals Overlay */}
                    <div className="relative bg-slate-100 h-full overflow-hidden">
                        <img
                            src={allImages[currentImageIndex]}
                            alt={car.name}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.1),transparent)] pointer-events-none"></div>

                        {/* Condition Badge Overlay */}
                        <div className="absolute top-8 left-8 z-20">
                            <div className={`px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 ${car.condition === 'New'
                                    ? 'bg-indigo-600/90 text-white'
                                    : 'bg-slate-800/90 text-white'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${car.condition === 'New' ? 'bg-white animate-pulse' : 'bg-amber-400'}`}></span>
                                {car.condition === 'New' ? 'Brand New' : 'Pre-Owned'}
                            </div>
                        </div>

                        {/* Thumbnail Bar */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
                            {allImages.slice(0, 5).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setImageLoaded(false); setCurrentImageIndex(i); }}
                                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="p-6 md:p-8 flex flex-col justify-between bg-white relative h-full overflow-hidden">
                        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pr-2">
                            {renderTabContent()}
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

            <PurchaseModal
                car={car}
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
            />
        </div>
    );
};

export default CarDetailsPage;
