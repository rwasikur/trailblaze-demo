import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-full bg-[linear-gradient(180deg,#020617_0%,#0f172a_40%,#e2e8f0_40%,#f8fafc_100%)]">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/car3.avif" alt="Background" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/75"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(74,101,114,0.45),_transparent_36%)]"></div>
                </div>

                <div className="relative z-10 mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 backdrop-blur-md">
                            Premium fleet available now
                        </div>

                        <h1 id="hero-heading" className="mt-8 text-balance text-5xl font-black leading-[1.02] text-white md:text-7xl">
                            Drive Your Dream. Find your perfect car from our premium fleet.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                            Explore a more cinematic landing experience, clearer catalogue browsing, and richer vehicle
                            detail pages designed to make discovery feel intentional from the first scroll.
                        </p>

                        <div className="mt-10">
                            <Button
                                id="browse-cars-cta"
                                onClick={() => navigate('/browse')}
                                className="group h-auto rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-2xl shadow-slate-950/30"
                            >
                                Explore Our Fleet
                                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-300">Premium selection</div>
                            <div className="mt-3 text-3xl font-black">10+ Vehicles</div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Browse sedans, SUVs, sports cars, and electric vehicles — all inspected and ready to drive.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 text-white backdrop-blur-xl">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-300">Transparent pricing</div>
                            <div className="mt-3 text-3xl font-black">No hidden fees</div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Every listing shows the full ex-showroom price with specs, fuel type, and availability upfront.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Verified listings</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">Every car, certified</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        All vehicles are verified by our dealership team with complete service history and inspection reports.
                    </p>
                </article>
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">All vehicle types</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">SUVs, Sedans & EVs</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        From compact city cars to powerful SUVs and cutting-edge electric vehicles — find exactly what you need.
                    </p>
                </article>
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Full specifications</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">Every detail, upfront</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Mileage, fuel type, transmission, seating, colours, and pricing — all visible before you inquire.
                    </p>
                </article>
            </section>
        </div>
    );
};

export default HomePage;
