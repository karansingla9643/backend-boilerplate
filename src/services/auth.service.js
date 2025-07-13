const httpStatus = require('http-status');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const utils = require('../utils/utils');
const db = require('../db/models');

async function loginUserWithEmailAndPassword(req) {
	const { email, password } = req.body;
	const user = await userService.getUserByEmail(email, {
		fields: ['id', 'name', 'email', 'password'],
		include: [{
			model: db.role,
			attributes: ['id', 'name'],
			required: true,
		}]
	});
	if (!user || !utils.comparePassword(password, user.password)) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password'
		);
	}
	return user;
}

module.exports = {
	loginUserWithEmailAndPassword,
};
