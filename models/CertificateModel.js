const { Sequelize } = require("sequelize");
const db = require("../config/database.js");

const Users = require("./UserModel");

const { DataTypes } = Sequelize;

const Certificate = db.define(
  "certificate",
  {
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  },
);

Users.hasMany(Certificate);
Certificate.belongsTo(Users, {foreignKey: 'userId'})

module.exports = Certificate;