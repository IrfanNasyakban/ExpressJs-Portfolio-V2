const { Sequelize } = require("sequelize");
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === 'development';

const db = new Sequelize(
    isDevelopment ? 'db_portfolio' : (process.env.DB_NAME || 'db_portfolio'),
    isDevelopment ? 'root' : process.env.DB_USERNAME,
    isDevelopment ? '' : process.env.DB_PASSWORD,
    {
        host: isDevelopment ? 'localhost' : process.env.DB_HOST_IP,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: isDevelopment ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = db;