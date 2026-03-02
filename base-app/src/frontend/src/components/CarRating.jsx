import React, { useState, useEffect } from 'react';

const ratingFeedback = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
};

// Simulated mock database of ratings for different cars to populate initially
const mockRatingsDB = {
    1: [5, 4, 4, 3, 5],
    2: [4, 4, 4, 5],
    3: [5, 5, 4, 5, 5],
};

const CarRating = ({ carId, readOnly = false, showBreakdown = false, lightTheme = false }) => {
    const getStoredRatings = () => {
        try {
            const storedData = localStorage.getItem('carRatingsDB');
            if (storedData) {
                const db = JSON.parse(storedData);
                if (db[carId]) return db[carId];
            } else {
                localStorage.setItem('carRatingsDB', JSON.stringify(mockRatingsDB));
            }
            return mockRatingsDB[carId] || [4, 4, 5]; // Default fake ratings if not in DB
        } catch (e) {
            return [4, 4, 5];
        }
    };

    const [ratings, setRatings] = useState(getStoredRatings());
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [showToast, setShowToast] = useState(false);

    // Derive counts & average
    const totalReviews = ratings.length;
    const averageRating = totalReviews === 0 ? 0 : (ratings.reduce((a, b) => a + b, 0) / totalReviews).toFixed(1);

    // Breakdown array creation
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
        const rounded = Math.round(r);
        if (breakdown[rounded] !== undefined) breakdown[rounded]++;
    });

    const handleRate = (rating) => {
        if (readOnly || userRating !== null) return;

        setUserRating(rating);
        const newRatings = [...ratings, rating];
        setRatings(newRatings);

        // Save to simulated DB in localStorage
        try {
            const storedData = localStorage.getItem('carRatingsDB');
            const db = storedData ? JSON.parse(storedData) : mockRatingsDB;
            db[carId] = newRatings;
            localStorage.setItem('carRatingsDB', JSON.stringify(db));
        } catch (e) {
            console.error("Could not save to localStorage", e);
        }

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="car-rating-component" style={{ margin: readOnly ? '0' : '1.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: readOnly ? 'column' : 'row', alignItems: readOnly ? 'flex-end' : 'center', gap: readOnly ? '4px' : '10px' }}>
                <div style={{ display: 'flex', gap: '2px', position: 'relative' }}>
                    {stars.map((star) => {
                        // Calculate star fill percentage for readOnly fractional stars
                        let fillPercentage = 0;
                        const currentHoverOrUser = hoverRating || userRating;

                        if (currentHoverOrUser) {
                            fillPercentage = currentHoverOrUser >= star ? 100 : 0;
                        } else {
                            fillPercentage = Math.max(0, Math.min(100, (averageRating - star + 1) * 100));
                        }

                        return (
                            <span
                                key={star}
                                onMouseEnter={() => !readOnly && !userRating && setHoverRating(star)}
                                onMouseLeave={() => !readOnly && !userRating && setHoverRating(0)}
                                onClick={() => handleRate(star)}
                                style={{
                                    fontSize: readOnly ? '1.2rem' : '1.8rem',
                                    cursor: readOnly || userRating !== null ? 'default' : 'pointer',
                                    color: lightTheme ? '#e0e0e0' : 'var(--star-bg, rgba(255,255,255,0.2))',
                                    position: 'relative',
                                    display: 'inline-block',
                                    transition: 'transform 0.2s ease',
                                    transform: hoverRating === star && !readOnly ? 'scale(1.2)' : 'scale(1)'
                                }}
                            >
                                ★
                                {/* Foreground Filled Star for fractional rating */}
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: `${fillPercentage}%`,
                                    overflow: 'hidden',
                                    color: 'var(--star-filled, #f4c150)',
                                }}>★</span>
                            </span>
                        );
                    })}
                </div>

                <div style={{ fontSize: readOnly ? '0.85rem' : '1rem', color: lightTheme ? '#777777' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: lightTheme ? '#111111' : 'var(--text-main)' }}>{averageRating}</span>
                    <span>({totalReviews} reviews)</span>
                </div>
            </div>

            {!readOnly && (hoverRating > 0 || userRating > 0) && (
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    color: 'var(--star-filled, #f4c150)',
                    height: '1.5rem', // fixed height to prevent layout shift
                    lineHeight: '1.5rem'
                }}>
                    {userRating ? ratingFeedback[userRating] : ratingFeedback[hoverRating]}
                </div>
            )}

            {!readOnly && showToast && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '0.8rem 1rem',
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    display: 'inline-block',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    Thank you for rating this car!
                </div>
            )}

            {!readOnly && showBreakdown && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    maxWidth: '400px'
                }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '500' }}>Rating Breakdown</h4>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = breakdown[star];
                        const percentage = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
                        return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '12px' }}>
                                <span style={{ width: '45px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                                    {star} ★
                                </span>
                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        background: 'var(--star-filled, #f4c150)',
                                        transition: 'width 0.8s ease-out',
                                        borderRadius: '3px'
                                    }}></div>
                                </div>
                                <span style={{ width: '45px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                    {percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CarRating;
