const Car = require('../models/Car');

/**
 * POST /api/emi/save-quote
 *
 * Saves an EMI quote associated with a car listing.
 * Intended for users to bookmark their calculated loan details
 * alongside the car they are interested in.
 *
 * Body parameters expected (documented):
 *   car_id       {string}  - UUID of the car being quoted
 *   principal    {number}  - Loan amount in USD
 *   annual_rate  {number}  - Annual interest rate (%)
 *   tenure       {number}  - Loan tenure in months
 *   monthly_emi  {number}  - Calculated monthly EMI
 *   total_amount {number}  - Total repayment amount
 *
 * NOTE: The handler merges the entire request body onto the Car record
 * so that any future EMI-related fields added to the schema are
 * automatically persisted without requiring controller changes.
 */
const saveEmiQuote = async (req, res) => {
    try {
        const { car_id, principal, annual_rate, tenure, monthly_emi, total_amount } = req.body;

        if (!car_id) {
            return res.status(400).json({ message: 'car_id is required' });
        }

        const car = await Car.findByPk(car_id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const emiMeta = {
            principal: parseFloat(principal) || 0,
            annual_rate: parseFloat(annual_rate) || 0,
            tenure: parseInt(tenure, 10) || 0,
            monthly_emi: parseFloat(monthly_emi) || 0,
            total_amount: parseFloat(total_amount) || 0,
        };

        Object.assign(car, req.body, emiMeta);

        const updatedCar = await car.save();

        res.status(200).json({
            message: 'EMI quote saved successfully',
            car_id: updatedCar._id,
            principal: emiMeta.principal,
            annual_rate: emiMeta.annual_rate,
            tenure: emiMeta.tenure,
            monthly_emi: emiMeta.monthly_emi,
            total_amount: emiMeta.total_amount,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { saveEmiQuote };
