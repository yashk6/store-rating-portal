const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { validateRegistration } = require('../utils/validation');
const sequelize = require('../config/db');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({ error: 'Server error retrieving stats.' });
  }
};

// Add a User (Admin or Normal User)
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!role || !['admin', 'normal', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid or missing role.' });
    }

    const validationError = validateRegistration({ name, email, password, address });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
      role,
    });

    return res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Add User Error:', error);
    return res.status(500).json({ error: 'Server error adding user.' });
  }
};

// Add a Store (which also creates a corresponding owner user of role='store_owner')
const addStore = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, address, password } = req.body;

    // Validate using the same user guidelines since we'll create the owner user
    const validationError = validateRegistration({ name, email, password, address });
    if (validationError) {
      await transaction.rollback();
      return res.status(400).json({ error: validationError });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Email is already registered to a user/store owner.' });
    }

    const existingStore = await Store.findOne({ where: { email }, transaction });
    if (existingStore) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Email is already registered to a store.' });
    }

    // Create Owner User
    const owner = await User.create({
      name,
      email,
      password,
      address,
      role: 'store_owner',
    }, { transaction });

    // Create Store linked to the owner user
    const store = await Store.create({
      name,
      email,
      address,
      ownerId: owner.id,
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Store and Store Owner account registered successfully!',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Add Store Error:', error);
    return res.status(500).json({ error: 'Server error registering store.' });
  }
};

// View normal and admin users (with filters and sorting)
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    const where = {};
    
    // Filters
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    
    // If no role filter specified, return admin and normal users by default as per request:
    // "Can view a list of normal and admin users with: Name, Email, Address, Role."
    if (role) {
      where.role = role;
    } else {
      where.role = { [Op.in]: ['admin', 'normal'] };
    }

    // Sorting
    let order = [['name', 'ASC']];
    if (sortBy && ['name', 'email', 'address', 'role', 'createdAt'].includes(sortBy)) {
      const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order = [[sortBy, direction]];
    }

    const users = await User.findAll({
      where,
      order,
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ error: 'Server error retrieving users.' });
  }
};

// Get details of ALL users (including rating if Store Owner)
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    };

    if (user.role === 'store_owner' && user.store) {
      const ratings = user.store.ratings || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      response.storeName = user.store.name;
      response.storeEmail = user.store.email;
      response.storeAddress = user.store.address;
      response.averageRating = Number(averageRating.toFixed(2));
      response.totalRatings = ratings.length;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('User Details Error:', error);
    return res.status(500).json({ error: 'Server error retrieving user details.' });
  }
};

// Get list of stores (with overall rating, filters, and sorting)
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    // Use raw query logic to retrieve stores and calculate rating cleanly
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
            'averageRating',
          ],
        ],
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email'],
        },
      ],
    });

    // Formatting for client
    let result = stores.map(store => {
      const data = store.toJSON();
      data.averageRating = Number(Number(data.averageRating).toFixed(2));
      return data;
    });

    // Handle sorting programmatically due to virtual aggregate column
    if (sortBy) {
      const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'rating') {
          valA = a.averageRating;
          valB = b.averageRating;
        }

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * direction;
        }
        return (valA - valB) * direction;
      });
    } else {
      // Default sorting: Name ascending
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Stores Error:', error);
    return res.status(500).json({ error: 'Server error retrieving stores.' });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getUserDetails,
  getStores,
};
