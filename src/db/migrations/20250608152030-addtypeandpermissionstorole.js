'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) add the new ENUM column
    await queryInterface.addColumn('role', 'type', {
      type: Sequelize.ENUM('default', 'project'),
      allowNull: false,
      defaultValue: 'default',
    });
    // 2) add the permissions array
    await queryInterface.addColumn('role', 'permissions', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    // (no need to drop created_date_time/modified_date_time — they stay)
  },

  down: async (queryInterface, Sequelize) => {
    // reverse: remove the two new columns
    await queryInterface.removeColumn('role', 'permissions');
    await queryInterface.removeColumn('role', 'type');
    // and drop the enum type itself (Postgres)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_role_type";'
    );
  },
};
