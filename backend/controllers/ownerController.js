const { Store, Rating, User } = require('../models');

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy, sortOrder } = req.query;

    // Find the store owned by this user
    const store = await Store.findOne({
      where: { ownerId },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found for this account.' });
    }

    // Get all ratings for this store including the user details
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'address'],
        },
      ],
    });

    // Compute average rating
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    // Format list of ratings
    let list = ratings.map(r => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      userName: r.user ? r.user.name : 'Unknown User',
      userEmail: r.user ? r.user.email : 'N/A',
      userAddress: r.user ? r.user.address : 'N/A',
    }));

    // Sorting
    if (sortBy) {
      const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      list.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * direction;
        }
        return (valA - valB) * direction;
      });
    } else {
      // Default: Latest ratings first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      storeId: store.id,
      storeName: store.name,
      storeEmail: store.email,
      storeAddress: store.address,
      averageRating: Number(averageRating.toFixed(2)),
      totalRatings,
      ratings: list,
    });
  } catch (error) {
    console.error('Owner Dashboard Error:', error);
    return res.status(500).json({ error: 'Server error retrieving owner dashboard metrics.' });
  }
};

module.exports = {
  getOwnerDashboard,
};
