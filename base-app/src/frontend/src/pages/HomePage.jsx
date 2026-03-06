import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            margin: '-2rem -5.5% -2rem -5.5%', /* Stretch beyond app-container padding */
            height: 'calc(100vh - 66px)',      /* Exactly fill the remaining viewport (No Scroll) */
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden', /* Strictly prevent scrollbars on dashboard */
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/car3.avif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <div style={{ zIndex: 1, textAlign: 'center', position: 'absolute', top: '10vh', width: '100%', padding: '0 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#f0f8ff', textShadow: '0 4px 15px rgba(0,0,0,0.8)', fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-1px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
                    Drive Your Dream<br />Journey
                </h1>
                <p style={{ color: '#eef2f7', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontSize: '1rem', fontWeight: 400, margin: '0 auto 0 auto', fontFamily: 'Inter, sans-serif', maxWidth: '600px', lineHeight: 1.5 }}>
                    Book premium cars for unforgettable long drives and epic travel adventures. Explore breathtaking destinations in style.
                </p>
                <button
                    className="btn"
                    onClick={() => navigate('/browse')}
                    style={{ marginTop: '10rem', background: '#ffffff', color: '#111111', fontSize: '0.9rem', padding: '0.8rem 2.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)' }}>
                    Explore Cars
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>&rarr;</span>
                </button>
            </div>
        </div>
    );
};

export default HomePage;
