import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';

const CarDetailsPage = () => {
    const getColorCode = (name) => {
        if (!name) return '#000';
        const colors = {
            'Martini Racing': '#ffffff', // Primary white with livery
            'Grey Alcantara': '#4a4a4a',
            'Pearl White': '#fcfaf0',
            'Carmine Red': '#a50021',
            'Brooklyn Grey': '#8e918f',
            'Midnight Blue': '#191970',
            'Rosso Corsa': '#d40000',
            'Obsidian Black': '#0b0b0b',
            'Alfa Red': '#b00000',
            'Fuji White': '#fcfcfc',
            'Light Oyster': '#d1d1d1',
            'Jet Black Metallic': '#050505',
            'Luxor Beige': '#d2b48c',
            'Suzuka Grey': '#dcdcdc',
            'Torch Red': '#ff0000',
            'Adrenaline Red': '#e60000',
            'Grabber Blue': '#00aae4',
            'Black Onyx': '#0f0f0f',
            'Infrared': '#8b0000',
            'Toasted Caramel': '#8b5a2b',
            'Polar Silver': '#bcbcbc',
            'Le Mans Blue': '#000080',
            'Blue-Black Metallic': '#0a0a1a',
            'Bayside Blue': '#0047ab',
            'Grey Cloth': '#808080',
            'Formula Red': '#cc0000',
            'Renaissance Red': '#cc0000',
            'Titanium Grey': '#565e5e',
            'Mars Red': '#ad0e0e',
            'Checkered Cloth': '#333333',
            'Signature Black': '#000000',
            'Boticelli Leather': '#3d2b1f'
        };
        const normalized = Object.keys(colors).find(k => k.toLowerCase() === name.toLowerCase());
        return normalized ? colors[normalized] : name;
    };

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
    }, [id]);

    if (loading) return (
        <div className="min-h-full bg-slate-50 flex items-center justify-center">
            <p className="text-slate-400 font-medium animate-pulse">Scanning vehicle signatures...</p>
        </div>
    );

    if (!car) return (
        <div className="min-h-full bg-slate-50 flex items-center justify-center p-10">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Vehicle Not Found</h2>
                <Button onClick={() => navigate(-1)} className="mt-4">Back to Fleet</Button>
            </div>
        </div>
    );

    const allImages = [car.image_url || '/car3.avif'];
    if (car.secondary_images && Array.isArray(car.secondary_images)) {
        allImages.push(...car.secondary_images);
    }

    const tabs = ['Overview', 'Price', 'Specs', 'History', 'Colours', 'Range', 'Images'].filter(tab => {
        if (tab === 'History' && (car.condition === 'New' || !car.number_of_owners || car.number_of_owners === 0)) return false;
        return true;
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Price':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h3>
                        <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                <span className="text-slate-500 font-bold">Ex-Showroom Price</span>
                                <span className="text-2xl font-black text-slate-900">${car.price_per_day?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                <span className="text-slate-500 font-bold">Estimated Registration</span>
                                <span className="text-slate-900 font-bold">Varies by City</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-blue-600 font-black uppercase tracking-tighter text-xl">Valuation</span>
                                <span className="text-4xl font-black text-blue-600">${car.price_per_day?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
            case 'Specs':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Vehicle Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { l: 'Mileage', v: car.mileage || 'Low Mile' },
                                { l: 'Transmission', v: car.transmission },
                                { l: 'Previous Owners', v: car.number_of_owners || 0 },
                                { l: 'City Hub', v: car.registration_city || 'HQ' },
                                { l: 'Validity', v: car.insurance_validity || 'Valid' },
                                { l: 'Seating', v: `${car.seating_capacity} Seats` },
                            ].map((s, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.l}</div>
                                    <div className="font-extrabold text-slate-900">{s.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4">
                            <p className="text-slate-500 text-sm leading-relaxed">{car.description || 'No additional description provided.'}</p>
                        </div>
                    </div>
                );
            case 'History':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Ownership History</h3>
                        <div className="space-y-4">
                            {car.saleHistory && car.saleHistory.length > 0 ? (
                                [...car.saleHistory].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)).map((sale, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl relative group hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Acquisition Date</div>
                                                <div className="font-extrabold text-slate-900">{new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction Value</div>
                                                        <div className="font-black text-blue-600 text-lg">${sale.price?.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-4">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Previous Holder</div>
                                                <div className="text-xs font-bold text-slate-700">{sale.seller_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">New Registrant</div>
                                                <div className="text-xs font-bold text-slate-700">{sale.buyer_name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No verified history available</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'Colours':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Aesthetic Profiles</h3>
                        <div className="grid gap-6">
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="w-16 h-16 rounded-2xl shadow-inner border-4 border-white" style={{ backgroundColor: getColorCode(car.exterior_color) }}></div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exterior Finish</div>
                                    <div className="text-xl font-black text-slate-900">{car.exterior_color || 'Signature Black'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="w-16 h-16 rounded-2xl shadow-inner border-4 border-white" style={{ backgroundColor: getColorCode(car.interior_color) }}></div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Interior Theme</div>
                                    <div className="text-xl font-black text-slate-900">{car.interior_color || 'Boticelli Leather'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Range':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 h-full flex flex-col justify-center">
                        <div className="text-center space-y-4">
                            <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Operational Radius</h3>
                            <div className="text-6xl font-black text-slate-950 tracking-tighter">{car.range || '∞'}</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Estimated capability per cycle</p>
                        </div>
                    </div>
                );
            case 'Images':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Media Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {allImages.map((img, idx) => (
                                <div key={idx} className="relative group aspect-video overflow-hidden rounded-2xl border border-slate-200 cursor-zoom-in" onClick={() => setFullScreenImage(img)}>
                                    <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: // Overview
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">{car.brand}</div>
                            <h1 id="car-detail-name" className="text-4xl font-black text-slate-900 tracking-tight leading-none">{car.name}</h1>
                            <div className="mt-3 flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${car.condition === 'New' ? 'bg-blue-600 text-white border-blue-600' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                    {car.condition === 'New' ? 'Brand New' : 'Certified Elite'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Acquisition</div>
                                    <div className="text-4xl font-black tracking-tight">${car.price_per_day?.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">Official Seller</div>
                                    <div className="text-base font-bold">{car.seller_name || 'Trailblaze HQ'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">System</div>
                                <div className="font-extrabold text-slate-900 text-sm">{car.fuel_type}</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Class</div>
                                <div className="font-extrabold text-slate-900 text-sm">{car.body_type || 'GT'}</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Range</div>
                                <div className="font-extrabold text-blue-600 text-sm">{car.range || 'Max'}</div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-full bg-slate-50 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

                {/* Minimal Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 hover:text-slate-900 flex items-center gap-2 group transition-all"
                    >
                        <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">←</span>
                        Back to Catalogue
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-1.5 flex gap-2 w-fit border border-slate-200 shadow-sm mx-auto md:mx-0 overflow-x-auto no-scrollbar max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Master Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden grid lg:grid-cols-[1fr_0.8fr] h-[600px] max-h-[75vh]">

                    {/* Left: Dynamic Visuals Overlay */}
                    <div className="relative bg-slate-100 h-full overflow-hidden">
                        <img
                            src={allImages[currentImageIndex]}
                            alt={car.name}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.1),transparent)] pointer-events-none"></div>

                        {/* Thumbnail Bar */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 p-2.5 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                            {allImages.slice(0, 5).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setImageLoaded(false); setCurrentImageIndex(i); }}
                                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === i ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Focused Content Area */}
                    <div className="p-8 md:p-10 flex flex-col justify-between bg-white relative h-full overflow-hidden">
                        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pr-2">
                            {renderTabContent()}
                        </div>

                        {/* Admin Action Bar */}
                        {localStorage.getItem('adminToken') && (
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end shrink-0">
                                <Button
                                    variant="slate"
                                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10"
                                    onClick={() => navigate(`/admin/edit-car/${car._id}`)}
                                >
                                    Edit Details
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {fullScreenImage && (
                <div onClick={() => setFullScreenImage(null)} className="fixed inset-0 bg-slate-950/98 flex items-center justify-center z-[1100] p-6 backdrop-blur-sm animate-in fade-in duration-300">
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-8 right-8 text-white text-4xl font-extralight hover:scale-125 transition-all">&times;</button>
                    <img src={fullScreenImage} alt="Maximized" className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl" />
                </div>
            )}
        </div>
    );
};

export default CarDetailsPage;
