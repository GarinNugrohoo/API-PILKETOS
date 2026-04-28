"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password_hash = await bcrypt.hash("admin", 10);

    return queryInterface.bulkInsert("Panitia", [
      {
        nama: "admin",
        password: password_hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Panitia", { nama: "admin" }, {});
  },
};
