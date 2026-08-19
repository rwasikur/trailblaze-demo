const Sale = require('../models/Sale');
const Car = require('../models/Car');

const getSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [{ model: Car, as: 'car' }],
            order: [['sale_date', 'DESC']]
        });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { getSales };
