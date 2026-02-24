import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:8000/api/admin/login', { username, password });
            localStorage.setItem('adminToken', data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <div style={{
            margin: '-2rem -5.5% -2rem -5.5%',
            minHeight: 'calc(100vh - 84px)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            overflow: 'hidden'
        }}>
            {/* Split Composite Background Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', zIndex: -1 }}>
                <div style={{ flex: 1, backgroundImage: 'url("/group of cars.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/latest admin car.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
                <div style={{ flex: 1, backgroundImage: 'url("/car1.webp")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)' }}></div>
            </div>

            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'rgba(0, 0, 0, 0.75)', zIndex: 1 }}>
                <h2 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Admin Portal</h2>
                {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password123"
                            required
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Secure Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
