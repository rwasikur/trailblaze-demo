const highlightItems = [
  {
    title: 'Magazine-style cards',
    copy: 'Larger imagery, cleaner data grouping, and stronger editorial hierarchy across every listing.',
  },
  {
    title: 'Full vehicle story',
    copy: 'Specs, colours, price notes, and imagery are easier to scan before diving into details.',
  },
  {
    title: 'Smoother flow',
    copy: 'Normal page scrolling is restored so browsing and detail reading no longer feel trapped.',
  },
];

const CatalogueHighlights = () => {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {highlightItems.map((item) => (
        <article
          key={item.title}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.title}</div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{item.copy}</p>
        </article>
      ))}
    </section>
  );
};

export default CatalogueHighlights;
