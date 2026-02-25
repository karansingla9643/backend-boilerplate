const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');
const pick = require('../utils/pick');
const { RoleOut } = require('../responses/RoleBase');

const createRole = catchAsync(async (req, res) => {
	const role = await roleService.createRole(req.body);
	res.send({ role: RoleOut.serialize(role) });
});

const getRoles = catchAsync(async (req, res) => {
	const options = pick(req.query, ['sortBy', 'limit', 'page', 'include']);

	const filter = {};

	if (req.query.search) {
		filter.$or = [
			{ name: { $like: `%${req.query.search}%` } },
			{ description: { $like: `%${req.query.search}%` } },
		];
	}

	const roles = await roleService.getRoles(filter, options);
	res.send(RoleOut.paginate(roles));
});

const getRole = catchAsync(async (req, res) => {
	const role = await roleService.getRoleById(req.params.roleId);
	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	res.send({ role: RoleOut.serialize(role) });
});

const deleteRole = catchAsync(async (req, res) => {
	await roleService.deleteRoleById(req.params.roleId);
	res.send({ success: true });
});

const updateRole = catchAsync(async (req, res) => {
	const role = await roleService.updateRole(req.body);
	res.send({ role: RoleOut.serialize(role) });
});

module.exports = {
	createRole,
	getRoles,
	getRole,
	updateRole,
	deleteRole,
};
