const { paginate, toJSON } = require('../plugins');

module.exports = (sequelize, DataTypes) => {
    const Membership = sequelize.define('membership', {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'membership',
        timestamps: true
    });

    paginate(Membership);
    toJSON(Membership);

    Membership.associate = (models) => {
        Membership.belongsTo(models.user, {
            foreignKey: 'userId',
            onDelete: 'CASCADE'
            // will create .getUser(), .setUser(), and a virtual “user” property
        });
        Membership.belongsTo(models.project, {
            foreignKey: 'projectId',
            onDelete: 'CASCADE'
        });
        Membership.belongsTo(models.role, {
            foreignKey: 'roleId',
            onDelete: 'CASCADE'
        });
    };

    return Membership;
};
