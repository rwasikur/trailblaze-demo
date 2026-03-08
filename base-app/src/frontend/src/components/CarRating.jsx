import React, { useState, useEffect } from 'react';

import api from '../api';

const ratingFeedback = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
};

const CarRating = ({ carId, readOnly = false, showBreakdown = false, lightTheme = false }) => {
    const [ratingSum, setRatingSum] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                if (carId) {
                    const { data } = await api.get(`/api/cars/${carId}/ratings`);
                    if (data) {
                        setRatingSum(data.rating_sum || 0);
                        setRatingCount(data.rating_count || 0);
                    }
                }
            } catch (error) {
                console.error('Error fetching ratings', error);
            }
        };
        fetchRatings();
    }, [carId]);

    // Derive counts & average
    const totalRatings = ratingCount + (userRating ? 1 : 0);
    const currentSum = ratingSum + (userRating || 0);
    const averageRating = totalRatings === 0 ? 0 : (currentSum / totalRatings).toFixed(1);

    const handleRate = async (rating) => {
        if (readOnly || userRating !== null) return;

        setUserRating(rating);

        try {
            if (carId) {
                await api.post(`/api/cars/${carId}/rate`, { rating });
            }
        } catch (e) {
            console.error("Could not save rating to backend", e);
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
                    <span>({totalRatings} ratings)</span>
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

        </div>
    );
};

export default CarRating;
