module.exports = function toJSONPlugin(Model) {
    // Override instance toJSON to return plain object
    Model.prototype.toJSON = function () {
        // this.get({ plain: true }) returns only dataValues
        return this.get({ plain: true });
    };
};