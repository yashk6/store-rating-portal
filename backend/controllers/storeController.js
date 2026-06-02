const { Op } = require('sequelize');
const { Store, Rating, User } = require('../models');
const sequelize = require('../config/db');

// Get all stores with details, search filters, overall rating, and user's submitted rating
const getStoresList = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const { name, address, sortBy, sortOrder } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    // Fetch stores along with average rating
    const stores = await Store.findAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(rating), 0)
              FROM ratings AS r
              WHERE r.store_id = "Store".id
            )`),
            'overallRating',
          ],
        ],
      },
    });

    // Fetch user's ratings to map them
    const userRatings = await Rating.findAll({
      where: { userId },
      attributes: ['storeId', 'rating'],
    });

    // Create a map of storeId -> userRating
    const userRatingsMap = {};
    userRatings.forEach(ur => {
      userRatingsMap[ur.storeId] = ur.rating;
    });

    // Formatting output
    let result = stores.map(store => {
      const data = store.toJSON();
      data.overallRating = Number(Number(data.overallRating).toFixed(2));
      data.userRating = userRatingsMap[data.id] || null; // Rating submitted by this user
      return data;
    });

    // Sorting
    if (sortBy) {
      const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'rating') {
          valA = a.overallRating;
          valB = b.overallRating;
        }

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * direction;
        }
        return (valA - valB) * direction;
      });
    } else {
      // Default: Name ascending
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Store List Error:', error);
    return res.status(500).json({ error: 'Server error retrieving stores.' });
  }
};

// Submit or modify rating
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = req.params.id;
    const { rating } = req.body;

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    // Upsert rating (if exists update, else create)
    const [ratingRecord, created] = await Rating.findOrCreate({
      where: { userId, storeId },
      defaults: { rating: ratingVal },
    });

    if (!created) {
      ratingRecord.rating = ratingVal;
      await ratingRecord.save();
    }

    // Calculate new overall rating
    const avgResult = await Rating.findOne({
      where: { storeId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
      ],
      raw: true,
    });

    const overallRating = Number(Number(avgResult.avgRating || 0).toFixed(2));

    return res.status(200).json({
      message: created ? 'Rating submitted successfully!' : 'Rating updated successfully!',
      rating: ratingVal,
      overallRating,
    });
  } catch (error) {
    console.error('Submit Rating Error:', error);
    return res.status(500).json({ error: 'Server error submitting rating.' });
  }
};

module.exports = {
  getStoresList,
  submitRating,
};
