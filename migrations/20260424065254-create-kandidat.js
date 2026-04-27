"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Kandidats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nomor_urut: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      nama_kandidat: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      visi: {
        type: Sequelize.STRING,
      },
      misi: {
        type: Sequelize.STRING,
      },
      image_kandidat: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      pemilih: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Kandidats");
  },
};
