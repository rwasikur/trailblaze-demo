const Offer = require('../models/Offer');
const Car = require('../models/Car');
const { Op } = require('sequelize');

const serializeOffer = (offer) => offer.toJSON ? offer.toJSON() : offer;

const isActiveOffer = (offer, now = new Date()) => {
    const activation = new Date(offer.activation_date);
    const expiry = new Date(offer.expiry_date);

    return offer.is_enabled && activation <= now && expiry >= now;
};

const offerMatchesCar = (offer, car) => {
    return String(offer.car_id || '') === String(car._id || '');
};

const calculateOfferDiscount = (car, discountPercent) => {
    const percent = Number(discountPercent);
    const safePercent = Number.isFinite(percent) ? percent : 0;
    const savingsAmount = Math.round((Number(car.price) || 0) * (safePercent / 100));

    return {
        discount_percent: safePercent,
        savings_amount: savingsAmount,
        discount_label: savingsAmount > 0 ? `Save $${savingsAmount.toLocaleString('en-US')}` : '',
    };
};

const getOfferStatus = (offer, now = new Date()) => {
    const activation = new Date(offer.activation_date);
    const expiry = new Date(offer.expiry_date);

    if (!offer.is_enabled) return 'Paused';
    if (activation > now) return 'Scheduled';
    if (expiry < now) return 'Expired';
    return 'Active';
};

const decorateOffersWithStatus = (offers) => {
    const now = new Date();
    return offers.map((offer) => ({
        ...serializeOffer(offer),
        status: getOfferStatus(offer, now),
    }));
};

const getCurrentMinute = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
};

const getMinuteTime = (date) => {
    const minuteDate = new Date(date);
    minuteDate.setSeconds(0, 0);
    return minuteDate.getTime();
};

const validateOfferPayload = (body, options = {}) => {
    const { requireFutureActivation = true, requireFutureExpiry = true } = options;
    const title = (body.title || '').trim();
    const badgeText = (body.badge_text || '').trim();
    const activationDate = new Date(body.activation_date);
    const expiryDate = new Date(body.expiry_date);
    const discountPercent = Number(body.discount_percent);
    const now = getCurrentMinute();

    if (!title || !badgeText) {
        return 'Offer title and badge text are required.';
    }

    if (!body.car_id) {
        return 'Please choose a vehicle for this offer.';
    }

    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 95) {
        return 'Discount percent must be between 0 and 95.';
    }

    if (Number.isNaN(activationDate.getTime()) || Number.isNaN(expiryDate.getTime())) {
        return 'Activation and expiry dates must be valid dates and times.';
    }

    if (requireFutureActivation && getMinuteTime(activationDate) < getMinuteTime(now)) {
        return 'Activation date and time cannot be in the past.';
    }

    if (requireFutureExpiry && getMinuteTime(expiryDate) < getMinuteTime(now)) {
        return 'Expiry date and time cannot be in the past.';
    }

    if (activationDate >= expiryDate) {
        return 'Expiry date and time must be after activation date and time.';
    }

    return null;
};

const validateOfferCar = async (carId, currentOfferId = null) => {
    const car = await Car.findByPk(carId);

    if (!car) {
        return { error: 'Selected vehicle was not found.' };
    }

    if (car.availability_status === 'Sold') {
        return { error: 'Offers cannot be applied to sold vehicles.' };
    }

    const duplicateWhere = {
        car_id: carId,
        expiry_date: { [Op.gte]: getCurrentMinute() },
    };
    if (currentOfferId) {
        duplicateWhere._id = { [Op.ne]: currentOfferId };
    }

    const existingOffer = await Offer.findOne({ where: duplicateWhere });
    if (existingOffer) {
        return { error: 'This vehicle already has an offer.' };
    }

    return { car };
};

const getAdminOffers = async (req, res) => {
    try {
        const offers = await Offer.findAll({
            include: [{ model: Car, as: 'car' }],
            order: [
                ['activation_date', 'DESC'],
                ['createdAt', 'DESC'],
            ],
        });
        res.json(decorateOffersWithStatus(offers));
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getActiveOffers = async (req, res) => {
    try {
        const offers = await Offer.findAll({
            include: [{ model: Car, as: 'car' }],
            order: [['activation_date', 'ASC']]
        });
        res.json(decorateOffersWithStatus(
            offers.filter((offer) => isActiveOffer(offer) && offer.car?.availability_status !== 'Sold')
        ));
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const createOffer = async (req, res) => {
    try {
        const validationError = validateOfferPayload(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { car, error } = await validateOfferCar(req.body.car_id);
        if (error) {
            return res.status(error === 'Selected vehicle was not found.' ? 404 : 400).json({ message: error });
        }

        const discount = calculateOfferDiscount(car, req.body.discount_percent);

        const offer = await Offer.create({
            title: req.body.title.trim(),
            badge_text: req.body.badge_text.trim(),
            description: req.body.description || '',
            car_id: req.body.car_id,
            ...discount,
            activation_date: req.body.activation_date,
            expiry_date: req.body.expiry_date,
            theme: req.body.theme || 'Signature',
            is_enabled: req.body.is_enabled !== undefined ? req.body.is_enabled : true,
            webhook_url: req.body.webhook_url,
        });

        if (offer.webhook_url) {
            fetch(offer.webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: offer._id, carId: offer.car_id, event: 'offer_published' })
            }).catch(() => { });
        }

        res.status(201).json({ ...serializeOffer(offer), status: getOfferStatus(offer) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create offer: ' + err.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        const validationError = validateOfferPayload(
            { ...serializeOffer(offer), ...req.body },
            {
                requireFutureActivation: req.body.activation_date !== undefined,
                requireFutureExpiry: req.body.expiry_date !== undefined,
            }
        );
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const nextCarId = req.body.car_id !== undefined ? req.body.car_id : offer.car_id;
        const { car, error } = await validateOfferCar(nextCarId, offer._id);
        if (error) {
            return res.status(error === 'Selected vehicle was not found.' ? 404 : 400).json({ message: error });
        }

        const discount = calculateOfferDiscount(
            car,
            req.body.discount_percent !== undefined ? req.body.discount_percent : offer.discount_percent
        );

        offer.title = req.body.title !== undefined ? req.body.title.trim() : offer.title;
        offer.badge_text = req.body.badge_text !== undefined ? req.body.badge_text.trim() : offer.badge_text;
        offer.description = req.body.description !== undefined ? req.body.description : offer.description;
        offer.car_id = nextCarId;
        offer.discount_percent = discount.discount_percent;
        offer.savings_amount = discount.savings_amount;
        offer.discount_label = discount.discount_label;
        offer.activation_date = req.body.activation_date !== undefined ? req.body.activation_date : offer.activation_date;
        offer.expiry_date = req.body.expiry_date !== undefined ? req.body.expiry_date : offer.expiry_date;
        offer.theme = req.body.theme !== undefined ? req.body.theme : offer.theme;
        offer.is_enabled = req.body.is_enabled !== undefined ? req.body.is_enabled : offer.is_enabled;
        offer.webhook_url = req.body.webhook_url !== undefined ? req.body.webhook_url : offer.webhook_url;

        const updatedOffer = await offer.save();

        if (updatedOffer.webhook_url) {
            fetch(updatedOffer.webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: updatedOffer._id, carId: updatedOffer.car_id, event: 'offer_updated' })
            }).catch(() => { });
        }

        res.json({ ...serializeOffer(updatedOffer), status: getOfferStatus(updatedOffer) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update offer: ' + err.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        await offer.destroy();
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete offer: ' + err.message });
    }
};

const patchCarOffer = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const { offer_webhook_url } = req.body;
        
        if (offer_webhook_url) {
            fetch(offer_webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carId: car._id, event: 'offer_activated' })
            }).catch(() => { });
        }

        res.json({ message: 'Offer updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = {
    decorateOffersWithStatus,
    getActiveOffers,
    getAdminOffers,
    isActiveOffer,
    offerMatchesCar,
    createOffer,
    updateOffer,
    deleteOffer,
    patchCarOffer,
};
