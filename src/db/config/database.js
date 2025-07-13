const { sqlDB, mysqlDB } = require('../../config/config');
const { user, ...rest } = mysqlDB;
const db = {
    development: {
        username: "root",
        host: "127.0.0.1",
        // host: "db",
        database: "testdb",
        password: "rootpassword",
        dialect: "mysql",
        port: 3307,
    },
    test: { username: user, ...rest },
    production: { username: user, ...rest },
}
// now export it under the three standard env names
module.exports = db;