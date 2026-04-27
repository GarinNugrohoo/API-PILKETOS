'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Maintenance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Maintenance.init({
    isMaintenance: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Maintenance',
  });
  return Maintenance;
};