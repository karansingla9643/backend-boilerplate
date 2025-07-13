const { paginate, toJSON } = require('../plugins');
module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define(
		'role',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.ENUM('default', 'project'),
				allowNull: false,
				defaultValue: 'default',
			},
			permissions: {
				type: DataTypes.JSON,
				allowNull: true,
			},
		},
		{
			tableName: 'role',
			timestamps: true,
		}
	);

	paginate(Role);
	toJSON(Role);

	Role.associate = (models) => {
		Role.hasMany(models.user, {
			foreignKey: 'role_id',
			onDelete: 'CASCADE',
		});
	};

	return Role;
};
