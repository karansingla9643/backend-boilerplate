const { roleService } = require('../services');

const rolesConfig = {
	roles: [],
	roleRights: new Map(),
};

async function loadRoleRights() {
	const { results: rows } = await roleService.getRoles({}, { type: 'default' });

	const map = new Map(rows.map(({ id, permissions }) => [
		id,
		permissions || [],
	]));

	rolesConfig.roleRights = map;
	rolesConfig.roles = Array.from(map.keys());
}

loadRoleRights().catch((err) => {
	console.error('Failed to load role rights:', err);
	process.exit(1);
});

module.exports = { rolesConfig };
