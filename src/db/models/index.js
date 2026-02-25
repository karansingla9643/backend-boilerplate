/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const config = require('../../config/config');

const basename = path.basename(__filename);
const db = {};

// ✅ Use sqlDB (Postgres), NOT mysqlDB
const sequelize = new Sequelize(
	config.sqlDB.database,
	config.sqlDB.user,
	config.sqlDB.password,
	{
		host: config.sqlDB.host,
		port: config.sqlDB.port,
		dialect: 'postgres',
		logging: false,
		pool: config.sqlDB.pool,
	}
);

// load all *.model.js files
fs.readdirSync(__dirname)
	.filter(
		(file) =>
			file.indexOf('.') !== 0 &&
			file !== basename &&
			file.endsWith('.model.js')
	)
	.forEach((file) => {
		const model = require(path.join(__dirname, file))(
			sequelize,
			Sequelize.DataTypes
		);
		db[model.name] = model;
	});

// run associations
Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
