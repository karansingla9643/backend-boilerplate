module.exports = {
	up: (queryInterface /* , Sequelize */) => {
		return queryInterface.bulkInsert('role', [
			{
				name: 'admin',
				description: 'some description',
				type: 'default',
				permissions: [
					"createProject",
					"readProject",
					"updateProject",
					"deleteProject",
				],
				created_date_time: new Date(),
			},
			{
				name: 'user',
				description: 'some description',
				type: 'default',
				permissions: [
					"createProject",
					"readProject",
				],
				created_date_time: new Date(),
			},
		]);
	},
	down: (queryInterface /* , Sequelize */) => {
		return queryInterface.bulkDelete('role', null, {});
	},
};
