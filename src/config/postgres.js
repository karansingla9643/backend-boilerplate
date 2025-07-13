// const { Client } = require('pg');
// const config = require('./config');
// const logger = require('./logger');

// let client;

// (async function name() {
// 	console.log('config.sqlDB', config.mysqlDB);
// 	client = new Client(config.mysqlDB);
// 	try {
// 		await client.connect();
// 		logger.info('Connect to postgress sucessfully');
// 		return client;
// 	} catch (error) {
// 		logger.error('Connect to postgress error', error);
// 		process.exit(1);
// 	}
// })();

// module.exports = {
// 	postgres: client,
// };


// src/mysql-client.js
// src/mysql-client.js
const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('./logger');

let connection;

(async function initMySQL() {
	try {
		// pull directly from config.sqlDB
		const { host, port, user, password, database } = config.mysqlDB;

		connection = await mysql.createConnection({
			host,
			port,
			user,
			password,
			database,
		});

		logger.info('✅ Connected to MySQL successfully');
	} catch (err) {
		logger.error('❌ MySQL connection error', err);
		process.exit(1);
	}
})();

module.exports = {
	mysql: connection,
};
