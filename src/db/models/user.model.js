// models/user.js
const bcrypt = require('bcryptjs');
const { paginate, toJSON } = require('../plugins');
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'user',
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
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					isEmail: true,
				},
			},
			role_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [8, 255],
					is: {
						args: /^(?=.*[A-Za-z])(?=.*\d).+$/,
						msg: 'Password must contain at least one letter and one number',
					},
				},
			},
		},
		{
			tableName: 'user',
			timestamps: true,
			hooks: {
				// hash password before creating or updating
				beforeSave: async (user, options) => {
					if (user.changed('password')) {
						user.password = await bcrypt.hash(user.password, 8);
					}
					// bump modifiedAt
					user.updatedAt = new Date();
				},
			},
		}
	);

	// Associations
	User.associate = (models) => {
		User.belongsTo(models.role, {
			foreignKey: 'role_id',
			onDelete: 'CASCADE',
		});
	};
	paginate(User);
	toJSON(User);

	// Static helpers to check uniqueness
	User.isEmailTaken = async (email, excludeUserId) => {
		const where = { email };
		if (excludeUserId) where.id = { [sequelize.Op.ne]: excludeUserId };
		const count = await User.count({ where });
		return count > 0;
	};

	return User;
};
