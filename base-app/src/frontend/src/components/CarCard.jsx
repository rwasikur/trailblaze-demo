import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Users, ArrowRight } from 'lucide-react';

const CarCard = ({ car }) => {
    return (
        <div className="car-card" style={{ position: 'relative' }}>
            <div className="badge">Available</div>
            <img 
                src={car.image_url ? (car.image_url.startsWith('http') ? car.image_url : `${import.meta.env.VITE_API_URL || ''}${car.image_url}`) : '/car3.avif'} 
                alt={`${car.brand || car.make} ${car.name || car.model}`} 
                className="car-image" 
                style={{ height: '220px' }} 
            />
            <div className="car-content">
                <h3 className="car-title" style={{ fontSize: '1.2rem' }}>{car.brand || car.make} {car.name || car.model}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Fuel size={14} /> {car.fuel_type || 'Petrol'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={14} /> {car.seating_capacity || 5} Seats
                    </span>
                </div>
                <div className="car-price" style={{ marginTop: 'auto' }}>
                    <span style={{    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 800, fontSize: '1.25rem'
 }}>${car.price_per_day?.toLocaleString()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}> / day</span>
                </div>

                <Link to={`/car/${car._id}`} style={{ textDecoration: 'none', marginTop: '1rem' }}>
                    <button className="btn btn-slate" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        View Details <ArrowRight size={16} />
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default CarCard;
