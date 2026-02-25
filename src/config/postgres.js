const { Client } = require('pg');
const config = require('./config');
const logger = require('./logger');

const client = new Client({
	host: config.sqlDB.host,
	port: config.sqlDB.port,
	user: config.sqlDB.user,
	password: config.sqlDB.password,
	database: config.sqlDB.database,
	ssl: false,
});

async function connectDB() {
	try {
		await client.connect();
		logger.info('Postgres connected successfully');
	} catch (error) {
		logger.error('Postgres connection failed', error);
		process.exit(1);
	}
}

module.exports = {
	client,
	connectDB,
};


// src/mysql-client.js
// src/mysql-client.js
// const mysql = require('mysql2/promise');
// const config = require('./config');
// const logger = require('./logger');

// let connection;

// (async function initMySQL() {
// 	try {
// 		// pull directly from config.sqlDB
// 		const { host, port, user, password, database } = config.mysqlDB;

// 		connection = await mysql.createConnection({
// 			host,
// 			port,
// 			user,
// 			password,
// 			database,
// 		});

// 		logger.info('✅ Connected to MySQL successfully');
// 	} catch (err) {
// 		logger.error('❌ MySQL connection error', err);
// 		process.exit(1);
// 	}
// })();

// module.exports = {
// 	mysql: connection,
// };
