"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Kandidat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Kandidat.init(
    {
      nomor_urut: DataTypes.INTEGER,
      nama_kandidat: DataTypes.STRING,
      password: DataTypes.STRING,
      visi: DataTypes.STRING,
      misi: DataTypes.STRING,
      image_kandidat: DataTypes.STRING,
      pemilih: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Kandidat",
    },
  );
  return Kandidat;
};
