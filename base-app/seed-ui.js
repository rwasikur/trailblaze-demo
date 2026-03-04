const mongoose = require('mongoose');
const Car = require('./src/backend/models/Car.js');

mongoose.connect('mongodb://localhost:27017/trailblazeauto', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        await Car.deleteMany({}); // Optional, clean up old demo cars
        const images = ['/car1.webp', '/car3.avif', '/group%20of%20cars.jpg', '/latest%20admin%20car.jpg'];
        const tags = ['Sunset Beast', 'Midnight Speedster', 'Premium Collection', 'Dealership Choice'];
        const descriptions = [
            'A beastly performance vehicle catching the beautiful sunset.',
            'Sleek, aerodynamic, and absolutely stunning in the moonlight.',
            'A comprehensive collection of our premier lineup.',
            'The absolute finest selection directly from our administrative team.'
        ];

        for (let i = 0; i < images.length; i++) {
            await Car.create({
                make: 'Trailblaze',
                model: tags[i],
                year: 2026,
                price: 55000 + (i * 15000),
                mileage: 15 + i * 1200,
                description: descriptions[i],
                imageUrl: images[i]
            });
        }
        console.log("Successfully seeded UI dashboard cars!");
        process.exit();
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
