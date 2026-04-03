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

                        <h1 className="mt-8 text-balance text-5xl font-black leading-[1.02] text-white md:text-7xl">
                            Elevate every drive with a catalogue built to feel as premium as the cars.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                            Explore a more cinematic landing experience, clearer catalogue browsing, and richer vehicle
                            detail pages designed to make discovery feel intentional from the first scroll.
                        </p>

                        <div className="mt-10">
                            <Button
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
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-300">Design upgrade</div>
                            <div className="mt-3 text-3xl font-black">Cleaner browsing</div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Better spacing, stronger hierarchy, and more polished visuals across landing, catalogue, and details.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 text-white backdrop-blur-xl">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-300">Usability fix</div>
                            <div className="mt-3 text-3xl font-black">Scroll restored</div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                The page layout now scrolls normally again, including catalogue browsing and detailed vehicle reading.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Curated visual system</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">A landing page with depth</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        The homepage now feels like a proper front door instead of a static hero locked to one screen.
                    </p>
                </article>
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Catalogue focus</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">Editorial browsing flow</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Featured inventory, cleaner card composition, and clearer metadata make the collection easier to scan.
                    </p>
                </article>
                <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Detail view</div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">More readable car stories</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Vehicle pages are structured to show imagery, pricing, specs, and descriptions without clipping content.
                    </p>
                </article>
            </section>
        </div>
    );
};

export default HomePage;
