import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import CarCard from '../components/CarCard';
import CatalogueHero from '../components/catalogue/CatalogueHero';
import CatalogueHighlights from '../components/catalogue/CatalogueHighlights';

const BrowseCarsPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/cars');
                setCars(data.cars || []);
            } catch (error) {
                console.error('Error fetching cars', error);
                setCars([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    const featuredCar = useMemo(() => cars[0], [cars]);
    const remainingCars = useMemo(() => cars.slice(1), [cars]);

    return (
        <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_35%,#f8fafc_100%)] px-4 py-8 md:px-6 md:py-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-10">
                <CatalogueHero cars={cars} />
                <CatalogueHighlights />

                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white py-24 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                        <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                        <p className="mt-5 text-lg font-medium text-slate-500">Loading the collection...</p>
                    </div>
                ) : cars.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-24 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                        <h2 className="text-3xl font-black text-slate-900">No cars found</h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">The catalogue is empty right now.</p>
                    </div>
                ) : (
                    <>
                        {featuredCar && (
                            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
                                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Editor's pick</div>
                                            <h2 className="mt-2 text-3xl font-black text-slate-900">Lead story from the collection</h2>
                                        </div>
                                        <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500 md:block">
                                            Premium spotlight
                                        </div>
                                    </div>
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                                        Start with the hero vehicle, then continue into the full grid below. The layout is
                                        now split into a prominent feature and a clean browsing wall for the rest of the catalogue.
                                    </p>
                                </div>
                                <CarCard car={featuredCar} featured />
                            </section>
                        )}

                        <section className="space-y-5">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Full inventory</div>
                                    <h2 className="mt-2 text-3xl font-black text-slate-900">Browse every available machine</h2>
                                </div>
                            </div>

                            <div id="car-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {(remainingCars.length > 0 ? remainingCars : cars).map((car) => (
                                    <CarCard key={car._id} car={car} />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default BrowseCarsPage;

