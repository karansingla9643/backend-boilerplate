const dotenv = require('dotenv');
const path = require('path');
const Joi = require('@hapi/joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object({
	NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
	PORT: Joi.number().default(3000),

	// JWT
	JWT_SECRET: Joi.string().required(),
	JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
	JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
	COOKIE_EXPIRATION_HOURS: Joi.number().default(24),

	// Postgres
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().default(5432),
	DB_DATABASE_NAME: Joi.string().required(),
	DB_DIALECT: Joi.string().valid('postgres').default('postgres'),

	DB_MAX_POOL: Joi.number().default(10),
	DB_MIN_POOL: Joi.number().default(0),
	DB_IDLE: Joi.number().default(10000),

	// Email (optional)
	SMTP_HOST: Joi.string().allow(''),
	SMTP_PORT: Joi.number().allow(null),
	SMTP_USERNAME: Joi.string().allow(''),
	SMTP_PASSWORD: Joi.string().allow(''),
	EMAIL_FROM: Joi.string().allow(''),
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,

	jwt: {
		secret: envVars.JWT_SECRET,
		accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
	},

	cookie: {
		cookieExpirationHours: envVars.COOKIE_EXPIRATION_HOURS,
	},

	sqlDB: {
		host: envVars.DB_HOST,
		port: envVars.DB_PORT,
		user: envVars.DB_USERNAME,
		password: envVars.DB_PASSWORD,
		database: envVars.DB_DATABASE_NAME,
		dialect: 'postgres',
		pool: {
			max: envVars.DB_MAX_POOL,
			min: envVars.DB_MIN_POOL,
			idle: envVars.DB_IDLE,
		},
	},
	email: {
		smtp: {
			host: envVars.SMTP_HOST,
			port: envVars.SMTP_PORT,
			username: envVars.SMTP_USERNAME,
			password: envVars.SMTP_PASSWORD,
		},
		from: envVars.EMAIL_FROM,
	},
};
