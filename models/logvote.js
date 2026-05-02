'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LogVote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LogVote.init({
    id_Participants: DataTypes.INTEGER,
    id_Kandidats: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LogVote',
  });
  return LogVote;
};