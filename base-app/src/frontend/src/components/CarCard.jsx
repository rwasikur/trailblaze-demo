import React from 'react';
import { Link } from 'react-router-dom';
import CarRating from './CarRating';

const CarCard = ({ car }) => {
    return (
        <div className="car-card">
            <img src={car.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800'} alt={`${car.make} ${car.model}`} className="car-image" />
            <div className="car-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 className="car-title" style={{ margin: 0, lineHeight: 1.2 }}>{car.make} {car.model}</h3>
                    <CarRating carId={car._id} readOnly={true} />
                </div>
                <div className="car-price">${car.price.toLocaleString()}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {car.year} | {car.mileage.toLocaleString()} miles
                </div>
                <Link to={`/car/${car._id}`} style={{ textDecoration: 'none', marginTop: 'auto' }}>
                    <button className="btn" style={{ width: '100%' }}>View Details</button>
                </Link>
            </div>
        </div>
    );
};

export default CarCard;
