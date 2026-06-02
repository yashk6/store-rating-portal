const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Relationships
// A Store Owner User has one Store
User.hasOne(Store, { foreignKey: 'ownerId', as: 'store', onDelete: 'CASCADE' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Users (normal users) submit many Ratings
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Stores receive many Ratings
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = {
  User,
  Store,
  Rating,
};
