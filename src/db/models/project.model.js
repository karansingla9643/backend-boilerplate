const { paginate, toJSON } = require('../plugins');

module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('project', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        projectPrefix: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        numberOfOnePriority: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        numberOfTwoPriority: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    })

    paginate(Project);
    toJSON(Project);

    return Project;
}
