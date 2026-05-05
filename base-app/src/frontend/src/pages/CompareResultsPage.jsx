import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/Button';

const CompareResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const queryParams = new URLSearchParams(location.search);
    const ids = queryParams.get('ids');

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchComparison = async () => {
            if (!ids) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get(`/api/cars/compare?ids=${ids}`);
                setCars(data);
            } catch (error) {
                console.error('Error fetching comparison results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComparison();
    }, [ids]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Scanning Vehicle Signatures...</p>
                </div>
            </div>
        );
    }

    if (!ids || cars.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-2xl">
                        <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18 3-3-3-3" />
                            <path d="M6 15h12" />
                            <path d="m9 6-3 3 3 3" />
                            <path d="M18 9H6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Comparison Empty</h2>
                    <p className="text-slate-500 mb-8">Please select at least two vehicles from the collection to see a detailed side-by-side comparison.</p>
                    <Button onClick={() => navigate('/browse')} className="rounded-2xl px-10 py-4 font-black uppercase text-[10px] tracking-widest">Browse Fleet</Button>
                </div>
            </div>
        );
    }

    const specs = [
        { label: 'Brand', key: 'brand' },
        { label: 'Model', key: 'name' },
        { label: 'Year', key: 'model_year' },
        { label: 'Condition', key: 'condition' },
        { label: 'Price', key: 'price', format: (v) => v ? `₹${v.toLocaleString()}` : '—' },
        { label: 'Fuel Type', key: 'fuel_type' },
        { label: 'Transmission', key: 'transmission' },
        { label: 'Body Type', key: 'body_type', format: (v) => v || 'Curated' },
        { label: 'Seating', key: 'seating_capacity', format: (v) => v ? `${v} Seats` : '—' },
        { label: 'Efficiency', key: 'mileage' },
        { label: 'History', key: 'number_of_owners', format: (v) => (v === 0 || v === '0') ? 'First Hand' : (v ? `${v} Owners` : '—') },
        { label: 'Registered City', key: 'registration_city', format: (v) => v || 'Corporate HQ' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-4">
                        <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-blue-500 transition-all flex items-center gap-3 group">
                            <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white">←</span>
                            Back to Collection
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-white leading-none uppercase italic">
                            Spec <span className="text-blue-600">Comparison</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-900/80 border border-slate-800 px-6 py-3 rounded-full backdrop-blur-xl">
                            Analyzing <span className="text-blue-500 text-sm mx-1">{cars.length}</span> Masterpieces
                        </div>
                    </div>
                </div>

                <div className="relative overflow-x-auto rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl no-scrollbar">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr>
                                <th className="p-10 text-left border-b border-r border-white/5 bg-white/[0.03] w-72 sticky left-0 z-20 backdrop-blur-xl">
                                    <div className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500/80">Parameters</div>
                                </th>
                                {cars.map(car => (
                                    <th key={car._id} className="p-8 border-b border-white/5 min-w-[320px] bg-white/[0.01]">
                                        <div className="space-y-6">
                                            <div className="aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 relative group shadow-2xl">
                                                <img src={car.image_url} alt={car.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-600/90 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                                                        {car.condition}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">{car.brand}</div>
                                                <div className="text-2xl font-black text-white tracking-tight">{car.name}</div>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {specs.map((spec, idx) => (
                                <tr key={spec.key} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="p-6 text-left border-r border-white/5 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 sticky left-0 z-20 bg-slate-950/80 backdrop-blur-xl group-hover:text-blue-500 transition-colors">
                                        {spec.label}
                                    </td>
                                    {cars.map(car => (
                                        <td key={`${car._id}-${spec.key}`} className="p-6 text-center border-r last:border-r-0 border-white/5">
                                            <span className={`text-base font-bold tracking-tight ${spec.key === 'price' ? 'text-blue-400 text-2xl font-black' : 'text-slate-300'}`}>
                                                {spec.format ? spec.format(car[spec.key]) : (car[spec.key] || '—')}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="bg-white/[0.03]">
                                <td className="p-8 border-r border-white/5 sticky left-0 z-20 bg-slate-900/40 backdrop-blur-xl"></td>
                                {cars.map(car => (
                                    <td key={`actions-${car._id}`} className="p-8 text-center border-r last:border-r-0 border-white/5">
                                        <button
                                            onClick={() => navigate(`/car/${car._id}`)}
                                            className="w-full rounded-[1.25rem] py-5 font-black text-[10px] uppercase tracking-[0.2em] bg-white text-slate-950 hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl active:scale-95"
                                        >
                                            View Masterpiece
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompareResultsPage;
