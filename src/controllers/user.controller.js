const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { userService } = require('../services');
const db = require('../db/models');
const { Op } = require('sequelize');
const pick = require('../utils/pick');

const getUsers = catchAsync(async (req, res) => {
	const options = pick(req.query, ['sortBy', 'limit', 'page']);
	const filter = {}
	if (req.query.search) {
		filter[Op.or] = [
			{ name: { [Op.like]: `%${req.query.search}%` } },
			{ email: { [Op.like]: `%${req.query.search}%` } },
		];
	}
	options.select = { exclude: ['password'] }
	const users = await userService.getUsers(options, filter);
	res.send({ users });
});

const getUser = catchAsync(async (req, res) => {
	const fields = ['id', 'name', 'email'];
	const include = [
		{
			model: db.role,
			attributes: ['id', 'name'],
			required: true,
		}
	];
	const user = await userService.getUserById(req.params.userId, { fields, include });

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	res.send({ user });
});

const deleteUser = catchAsync(async (req, res) => {
	await userService.deleteUserById(req.params.userId);
	res.send({ success: true });
});

const updateUser = catchAsync(async (req, res) => {
	const user = await userService.updateUser(req);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	res.send({ user });
});

module.exports = {
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
