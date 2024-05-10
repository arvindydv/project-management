"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("designation", [
      {
        designation_code: "101",
        designation_title: "CEO",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        designation_code: "102",
        designation_title: "MANAGER",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        designation_code: "103",
        designation_title: "LEAD",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        designation_code: "104",
        designation_title: "DEVELOPER",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("designation", null, {});
  },
};
