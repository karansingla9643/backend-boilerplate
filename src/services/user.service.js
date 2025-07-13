const httpStatus = require('http-status');
const { getOffset } = require('../utils/query');
const ApiError = require('../utils/ApiError');
const config = require('../config/config.js');
const db = require('../db/models');
const roleService = require('./role.service');

async function getUserByEmail(email, options = {
	fields: ['id', 'name', 'email'],
	include: [{
		model: db.role,
		attributes: ['id', 'name'],
		required: true,
	}]
}) {
	const user = await db.user.findOne({
		where: { email },
		include: options.include,
		attributes: options.fields,
	});

	return user;
}

async function getUserById(id, options = {
	fields: ['id', 'name', 'email'],
	include: [{
		model: db.role,
		attributes: ['id', 'name'],
		required: true,
	}],
}) {
	const user = await db.user.findOne({
		where: { id },
		include: options.include,
		attributes: options.fields,
	});

	return user.get({ plain: true });
}

async function createUser(userBody) {
	const createdUser = await db.user.create(userBody).then((resultEntity) => resultEntity.get({ plain: true }));
	return createdUser;
}

async function getUsers(options, filter) {
	const users = await db.user.paginate(filter, options);
	return users;
}

async function deleteUserById(userId) {
	const deletedUser = await db.user.destroy({
		where: { id: userId },
	});

	if (!deletedUser) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	return deletedUser;
}

module.exports = {
	getUserByEmail,
	getUserById,
	createUser,
	getUsers,
	deleteUserById,
};
