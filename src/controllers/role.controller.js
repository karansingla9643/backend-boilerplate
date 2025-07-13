const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');
const pick = require('../utils/pick');

const createRole = catchAsync(async (req, res) => {
	const role = await roleService.createRole(req.body);
	res.send({ role });
});

const getRoles = catchAsync(async (req, res) => {
	const options = pick(req.query, ['sortBy', 'limit', 'page']);
	const filter = {}
	if (req.query.search) {
		filter[Op.or] = [
			{ name: { [Op.like]: `%${req.query.search}%` } },
			{ description: { [Op.like]: `%${req.query.search}%` } },
		];
	}
	const roles = await roleService.getRoles(options, filter);
	res.send({ roles });
});

const getRole = catchAsync(async (req, res) => {
	const role = await roleService.getRoleById(req.params.roleId);
	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	res.send({ role });
});

const deleteRole = catchAsync(async (req, res) => {
	await roleService.deleteRoleById(req.params.roleId);
	res.send({ success: true });
});

const updateRole = catchAsync(async (req, res) => {
	const role = await roleService.updateRole(req.body);
	res.send({ role });
});

module.exports = {
	createRole,
	getRoles,
	getRole,
	updateRole,
	deleteRole,
};
