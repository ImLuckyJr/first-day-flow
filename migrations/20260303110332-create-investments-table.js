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
    await queryInterface.createTable('investments', {
      investment_id: Sequelize.DataTypes.UUID,
      investor_id: Sequelize.DataTypes.UUID,
      investor_amount: Sequelize.DataTypes.DECIMAL(30,2),
      investment_state: Sequelize.DataTypes.BOOLEAN,
      loan_id: Sequelize.DataTypes.UUID,
      investment_strategy: Sequelize.DataTypes.DECIMAL(5,2),
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
