const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const db = require('../db/models');

async function getRoleById(roleId) {
	const role = await db.role.findOne({
		where: { id: roleId },
	});
	return role;
}

async function getRoleByName(name) {
	const role = await db.role.findOne({
		where: { name },
	});

	return role;
}

async function getRoles(options, filter) {
	const roles = await db.role.paginate(filter, options);
	return roles;
}

async function createRole(reqBody) {
	const { name, description = '' } = reqBody;
	const existedRole = await getRoleByName(name);

	if (existedRole) {
		throw new ApiError(httpStatus.CONFLICT, 'This role already exits');
	}

	const createdRole = await db.role
		.create({
			name,
			description,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdRole;
}

async function updateRole(reqBody) {
	const updatedRole = await db.role
		.update(
			{ ...reqBody },
			{
				where: { id: reqBody.roleId },
				returning: true,
				plain: true,
				raw: true,
			}
		)
		.then((data) => data[1]);

	return updatedRole;
}

module.exports = {
	getRoleById,
	getRoles,
	createRole,
	updateRole,
};
