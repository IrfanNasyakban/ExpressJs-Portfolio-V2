const { Sequelize } = require("sequelize");
const db = require("../config/database.js");

const Users = require("./UserModel");

const { DataTypes } = Sequelize;

const Organizations = db.define(
  "organizations",
  {
    organisasi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    divisi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    periode: {
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

Users.hasMany(Organizations);
Organizations.belongsTo(Users, {foreignKey: 'userId'})

module.exports = Organizations;