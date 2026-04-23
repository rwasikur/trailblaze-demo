import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-5rem)] w-full relative overflow-hidden bg-slate-950 flex flex-col font-outfit">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
                    alt="Pinnacle Fleet"
                    className="h-full w-full object-cover opacity-60 scale-105 animate-[pulse_15s_infinite_ease-in-out]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_50%)]"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">

                    <h1 id="hero-heading" className="text-balance text-5xl font-black leading-[0.95] text-white md:text-7xl lg:text-[5.5rem] tracking-tighter">
                        Elegance for <br /> <span className="text-blue-500 italic font-serif font-medium lowercase">everyone.</span>
                    </h1>

                    <p className="mt-8 mx-auto max-w-xl text-base leading-relaxed text-slate-400 font-medium tracking-wide">
                        Traverse our curated collection of pristine machines and certified automotive masterpieces. Designed for those who demand excellence in every single mile.
                    </p>

                    <div className="mt-12 flex flex-col items-center justify-center">
                        <Button
                            id="browse-cars-cta"
                            onClick={() => navigate('/browse')}
                            className="group h-16 rounded-2xl bg-blue-600 px-16 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
                        >
                            Explore The Fleet
                            <svg className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Compact Features Bar - Zero Scroll */}
            <div className="relative z-20 w-full bg-slate-950/40 backdrop-blur-xl border-t border-white/5 pb-8 pt-8">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { t: 'Brand New Machines', d: 'Zero-mile masterpieces direct from heritage collections.', b: 'HERITAGE' },
                            { t: 'Certified Pre-Owned', d: 'Rigorous 220-point diagnostic for factory-grade integrity.', b: 'CERTIFIED' },
                            { t: 'Global Logistics', d: 'Seamless acquisition architecture for a borderless experience.', b: 'CONCIERGE' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-2 text-left">
                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                    {item.b}
                                </div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{item.t}</h2>
                                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                    {item.d}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
