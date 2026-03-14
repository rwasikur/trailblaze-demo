import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, Car, ClipboardCheck, Key, ShieldCheck,
    Phone, Mail, Facebook, Twitter, Instagram,
    TrendingUp, CheckCircle, Award, Users
} from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    const brands = ["TOYOTA", "BMW", "MERCEDES", "HONDA", "AUDI", "HYUNDAI", "TESLA", "FORD", "VOLKSWAGEN", "NISSAN"];

    return (
        <div style={{ margin: '-2rem -5.5% -2rem -5.5%', background: 'var(--bg-color)' }}>

            {/* ── HERO ── */}
            <section style={{
                height: '100vh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(160deg, rgba(10,14,18,0.88) 40%, rgba(20,40,55,0.65) 100%), url("/car3.avif")',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                textAlign: 'center',
                padding: '0 2rem',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

                <div style={{ maxWidth: '800px', zIndex: 2, width: '100%' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(58,123,213,0.12)', border: '1px solid rgba(58,123,213,0.3)',
                        padding: '0.35rem 1.1rem', borderRadius: '100px',
                        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px',
                        textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: '1.5rem'
                    }}>
                        <Award size={12} /> India's Trusted Car Dealership
                    </div>

                    <h1 style={{
                        margin: '0 0 1.25rem 0', color: '#ffffff',
                        fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)', fontWeight: 900,
                        letterSpacing: '-2px', lineHeight: 1.05, textShadow: '0 8px 40px rgba(0,0,0,0.6)'
                    }}>
                        Own the Car<br />
                        <span style={{ color: 'var(--accent-light)' }}>You've Always Wanted</span>
                    </h1>

                    <p style={{
                        color: '#94a3b8', fontSize: '1.1rem', maxWidth: '560px',
                        margin: '0 auto 2.5rem', lineHeight: 1.7, textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        Browse certified pre-owned and new cars from top brands. Transparent pricing, easy financing, and a buying experience you'll love.
                    </p>

                    <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '480px', margin: '0 auto' }}>
                        <button className="btn btn-primary-hero" onClick={() => navigate('/browse')} style={{ flex: '1 1 180px', minWidth: '160px' }}>
                            Browse Inventory &rarr;
                        </button>
                        <button className="btn btn-ghost-hero"
                            onClick={() => document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' })}
                            style={{ flex: '1 1 180px', minWidth: '160px' }}>
                            Why Choose Us
                        </button>
                    </div>
                </div>

                <div className="scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    <ChevronDown size={28} />
                </div>

                <div className="glass-stats-bar">
                    {[
                        { value: '2,500+', label: 'Cars Sold' },
                        { value: '150+', label: 'Models Available' },
                        { value: '4.9★', label: 'Customer Rating' },
                        { value: '10+ Yrs', label: 'Trusted Since' },
                    ].map((s, i) => (
                        <div key={i} className="stat-item">
                            <span className="stat-value">{s.value}</span>
                            <span className="stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BRAND SCROLL ── */}
            <div style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid var(--glass-border)', borderTop: '1px solid var(--glass-border)' }}>
                <div className="brand-scroll">
                    {[...brands, ...brands].map((brand, i) => <div key={i} className="brand-item">{brand}</div>)}
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: '5rem 10%', textAlign: 'center' }}>
                <div className="section-eyebrow">Simple Process</div>
                <h2 className="section-heading">Your Journey to Ownership</h2>
                <p className="section-sub">Three steps to drive home your perfect car</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', marginTop: '3rem' }}>
                    {[
                        { num: '01', icon: <Car size={34} />, title: 'Browse & Shortlist', desc: 'Explore our full inventory of certified cars. Filter by brand, budget, fuel type, or body style to find your perfect match.' },
                        { num: '02', icon: <ClipboardCheck size={34} />, title: 'Inspect & Finance', desc: 'Schedule an inspection and get a detailed vehicle report. Apply for easy financing with our partner banks on the spot.' },
                        { num: '03', icon: <Key size={34} />, title: 'Drive It Home', desc: 'Complete paperwork, pay transparently, and drive away in your new car. Zero hidden fees, zero stress, total joy.' }
                    ].map((step, i) => (
                        <div key={i} className="step-card">
                            <div className="step-number">{step.num}</div>
                            <div className="feature-icon" style={{ zIndex: 1, position: 'relative' }}>{step.icon}</div>
                            <h3 style={{ zIndex: 1, position: 'relative', marginBottom: '0.75rem', fontSize: '1.05rem' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', zIndex: 1, position: 'relative', lineHeight: 1.7, fontSize: '0.9rem' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section id="why-us" style={{ padding: '5rem 10%', background: 'rgba(255,255,255,0.015)', textAlign: 'center' }}>
                <div className="section-eyebrow">Our Promise</div>
                <h2 className="section-heading">The TrailBlazeAuto Advantage</h2>
                <p className="section-sub">More than a dealership — a buying experience built on trust</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                    {[
                        { icon: <ShieldCheck size={26} />, title: 'Certified Quality', desc: 'Every car passes a rigorous 100-point inspection before listing.' },
                        { icon: <TrendingUp size={26} />, title: 'Best Market Price', desc: 'Competitive pricing ensures you never overpay for your car.' },
                        { icon: <Users size={26} />, title: 'Expert Guidance', desc: 'Dedicated advisors help you find the right car for your needs.' },
                        { icon: <CheckCircle size={26} />, title: 'Clear Ownership', desc: 'Full vehicle history, no hidden dues, clean RC transfer.' },
                    ].map((item, i) => (
                        <div key={i} className="feature-card" style={{ padding: '2rem' }}>
                            <div style={{ color: 'var(--accent-light)', marginBottom: '1.25rem' }}>{item.icon}</div>
                            <h4 style={{ marginBottom: '0.7rem', fontSize: '0.98rem' }}>{item.title}</h4>
                            <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{ padding: '3rem 5%' }}>
                <div className="cta-banner">
                    <div className="cta-decoration" />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                            Get Started Today
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'white', margin: '0.85rem 0 1rem', letterSpacing: '-1px' }}>
                            Ready to Find Your Car?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontSize: '0.98rem' }}>
                            Join over 2,500 satisfied customers who drove home their perfect car through TrailBlazeAuto.
                        </p>
                        <button className="btn btn-cta-white" onClick={() => navigate('/browse')}>
                            Browse All Cars &rarr;
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    <div>
                        <img src="/carlogo.png" alt="TrailBlazeAuto" style={{ height: '38px', marginBottom: '1.25rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.8 }}>
                            India's trusted car dealership. Certified vehicles with transparent pricing since 2014.
                        </p>
                    </div>
                    <div>
                        <h4 className="footer-heading">Inventory</h4>
                        <ul className="footer-list">
                            <li><a href="/browse">All Cars</a></li>
                            <li><a href="/browse">New Arrivals</a></li>
                            <li><a href="/browse">Certified Pre-Owned</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Company</h4>
                        <ul className="footer-list">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Financing Options</a></li>
                            <li><a href="#">Sell Your Car</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-heading">Contact</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} /> support@trailblazeauto.com
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={14} /> +91 98765 43210
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="social-icon"><Icon size={17} /></a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>&copy; {new Date().getFullYear()} TrailBlazeAuto. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;