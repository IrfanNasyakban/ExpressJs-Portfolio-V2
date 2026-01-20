const { Sequelize } = require("sequelize");
const db = require("../config/database.js");

const Users = require("./UserModel");

const { DataTypes } = Sequelize;

const Education = db.define(
  "education",
  {
    instansi: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bagian: {
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

Users.hasMany(Education);
Education.belongsTo(Users, {foreignKey: 'userId'})

module.exports = Education;