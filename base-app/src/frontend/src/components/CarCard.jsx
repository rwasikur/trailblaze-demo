import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
    return (
        <div className="car-card">
            <img src={car.imageUrl || '/car3.avif'} alt={`${car.make} ${car.model}`} className="car-image" />
            <div className="car-content">
                <h3 className="car-title">{car.make} {car.model}</h3>
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
