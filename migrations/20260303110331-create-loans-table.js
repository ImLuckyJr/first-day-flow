'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('loans', {
      loan_id: Sequelize.DataTypes.UUID,
      loan_sum: Sequelize.DataTypes.DECIMAL(30,2),
      loan_rate: Sequelize.DataTypes.DECIMAL(3,2),
      loan_issue_date: Sequelize.DataTypes.DATE,
      loan_pay_period: Sequelize.DataTypes.INTEGER,
      loan_days: Sequelize.DataTypes.INTEGER,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
