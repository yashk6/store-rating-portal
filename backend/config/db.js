const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'postgres';

let sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306),
      dialect: dialect,
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: dialect === 'postgres' ? {
        // Optional: Add SSL configuration if needed for production (e.g. AWS RDS)
        // ssl: { rejectUnauthorized: false }
      } : {}
    }
  );
}

module.exports = sequelize;
