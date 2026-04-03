const statItems = [
  { label: 'Curated brands', value: '12+' },
  { label: 'Luxury and performance picks', value: 'Top tier' },
  { label: 'Verified seller support', value: '24/7' },
];

const CatalogueHero = ({ cars = [] }) => {
  const availableCars = cars.filter(
    (car) => !car.availability_status || car.availability_status === 'Available'
  ).length;
  const electricCars = cars.filter((car) => car.fuel_type === 'Electric').length;
  const averagePrice =
    cars.length > 0
      ? Math.round(
          cars.reduce((sum, car) => sum + (Number(car.price_per_day) || 0), 0) / cars.length
        )
      : null;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(74,101,114,0.42),_transparent_35%)]" />
      <div className="relative grid gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-end lg:gap-16 lg:py-14">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
            Editorial catalogue
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-black leading-tight text-white md:text-6xl">
            Discover a sharper, more premium way to browse the Trailblazer collection.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Explore a cleaner catalogue with richer visuals, stronger hierarchy, and complete vehicle
            detail previews so every listing feels worth opening.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Currently listed</div>
            <div className="mt-3 text-3xl font-black text-white">{cars.length || '0'}</div>
            <div className="mt-2 text-sm text-slate-300">{availableCars} ready to explore right now</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Electric picks</div>
            <div className="mt-3 text-3xl font-black text-white">{electricCars || '0'}</div>
            <div className="mt-2 text-sm text-slate-300">Performance and efficiency in one lane</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Average sticker</div>
            <div className="mt-3 text-3xl font-black text-white">
              {averagePrice ? `$${averagePrice.toLocaleString()}` : 'TBD'}
            </div>
            <div className="mt-2 text-sm text-slate-300">A quick sense of the collection</div>
          </div>
        </div>
      </div>

      <div className="relative grid gap-4 border-t border-white/10 px-6 py-5 text-sm text-slate-300 md:px-10 lg:grid-cols-3">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span>{item.label}</span>
            <span className="font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CatalogueHero;
