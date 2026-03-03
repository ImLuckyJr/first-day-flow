'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('payment_schedule_investors', {
            psi_id:              Sequelize.DataTypes.INTEGER,
            loan_id:             Sequelize.DataTypes.UUID,
            investor_id:         Sequelize.DataTypes.UUID,
            psi_date_pay:        Sequelize.DataTypes.DATEONLY,
            psi_amount:          Sequelize.DataTypes.DECIMAL(30, 2),
            psi_income:          Sequelize.DataTypes.DECIMAL(30, 2),
            psi_income_strategy: Sequelize.DataTypes.DECIMAL(30, 2),
        });
    },
    
    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    },
};
