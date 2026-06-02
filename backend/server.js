const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const apiRoutes = require('./routes/api');
const { User, Store, Rating } = require('./models');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRoutes);

// Simple healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'Store Rating Portal API is running successfully!' });
});

// Auto-seed Default Admin and Sample Data (Runs only if no users exist)
const seedDefaultData = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('--- Database is empty. Seeding default data... ---');

      // 1. Create Default Admin
      const admin = await User.create({
        name: 'System Administrator Account', // 28 chars (min 20 requirement)
        email: 'admin@ratingportal.com',
        password: 'AdminPassword123!', // Validated password
        address: 'Main Administrative Center Office, New Delhi, India',
        role: 'admin',
      });
      console.log('✅ Default Admin seeded: admin@ratingportal.com / AdminPassword123!');

      // 2. Create Default Store Owner
      const owner1 = await User.create({
        name: 'Supermarket Owner Account', // 25 chars
        email: 'owner@groceryhub.com',
        password: 'OwnerPassword123!',
        address: '456 Retail Boulevard, Block-C, Connaught Place',
        role: 'store_owner',
      });
      console.log('✅ Default Store Owner seeded: owner@groceryhub.com / OwnerPassword123!');

      // 3. Create Store linked to owner1
      const store1 = await Store.create({
        name: 'The Organic Grocery Hub Store', // 29 chars
        email: 'store@groceryhub.com',
        address: '456 Retail Boulevard, Block-C, Connaught Place',
        ownerId: owner1.id,
      });
      console.log('✅ Default Store seeded: The Organic Grocery Hub Store');

      // 4. Create another Store Owner & Store
      const owner2 = await User.create({
        name: 'Fashion Retail Owner Account', // 27 chars
        email: 'owner@fashionhub.com',
        password: 'OwnerPassword123!',
        address: '789 Couture Avenue, Saket District Center',
        role: 'store_owner',
      });
      const store2 = await Store.create({
        name: 'Trendsetters Couture Boutique', // 30 chars
        email: 'store@fashionhub.com',
        address: '789 Couture Avenue, Saket District Center',
        ownerId: owner2.id,
      });
      console.log('✅ Second Store seeded: Trendsetters Couture Boutique');

      // 5. Create Default Normal Users
      const normalUser1 = await User.create({
        name: 'Regular Customer Account One', // 29 chars
        email: 'customer1@gmail.com',
        password: 'UserPassword123!',
        address: 'Flat 101, Sunshine Apartments, Rohini, Delhi',
        role: 'normal',
      });
      const normalUser2 = await User.create({
        name: 'Regular Customer Account Two', // 29 chars
        email: 'customer2@gmail.com',
        password: 'UserPassword123!',
        address: 'Flat 202, Moonshine Apartments, Dwarka, Delhi',
        role: 'normal',
      });
      console.log('✅ Normal Users seeded: customer1@gmail.com / customer2@gmail.com');

      // 6. Create Initial Ratings
      await Rating.create({
        userId: normalUser1.id,
        storeId: store1.id,
        rating: 5,
      });
      await Rating.create({
        userId: normalUser2.id,
        storeId: store1.id,
        rating: 4,
      });
      await Rating.create({
        userId: normalUser1.id,
        storeId: store2.id,
        rating: 3,
      });
      console.log('✅ Sample reviews and ratings seeded.');
      console.log('--- Database Seeding Completed successfully ---');
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
};

// Connect DB and Start Server
const startServer = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('🚀 Database connection has been established successfully.');

    // Sync models (creates tables if they don't exist)
    // Using alter: true will dynamically update schemas if models change
    await sequelize.sync({ alter: true });
    console.log('🚀 Database schemas synchronized successfully.');

    // Seed default admin
    await seedDefaultData();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`🚀 Express Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database or start server:', error);
  }
};

startServer();
