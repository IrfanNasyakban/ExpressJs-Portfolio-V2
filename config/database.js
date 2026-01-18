const { Sequelize } = require("sequelize");

const db = new Sequelize('db_portfolio', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})


module.exports = db