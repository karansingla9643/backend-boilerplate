const { Op } = require('sequelize');

/**
 * Recursively builds Sequelize-compatible filter conditions.
 */
function parseFilter(filter) {
    if (!filter || typeof filter !== 'object') return {};

    const build = (obj) => {
        const where = {};

        for (const [key, value] of Object.entries(obj)) {
            if (key === '$or' || key === '$and') {
                where[Op[key.slice(1)]] = value.map(build);
                continue;
            }

            if (typeof value === 'object' && !Array.isArray(value)) {
                const inner = {};
                for (const [op, val] of Object.entries(value)) {
                    const operator = mapOperator(op);
                    if (operator) {
                        inner[operator] = val;
                    }
                }
                where[key] = inner;
            } else {
                where[key] = value;
            }
        }

        return where;
    };

    return build(filter);
}

/**
 * Maps string operators to Sequelize.Op symbols.
 */
function mapOperator(op) {
    const normalized = op.replace(/^\$/, '').toLowerCase();
    switch (normalized) {
        case 'eq': return Op.eq;
        case 'ne': return Op.ne;
        case 'gt': return Op.gt;
        case 'gte': return Op.gte;
        case 'lt': return Op.lt;
        case 'lte': return Op.lte;
        case 'in': return Op.in;
        case 'nin': return Op.notIn;
        case 'like': return Op.like;
        case 'ilike': return Op.iLike;
        case 'notlike': return Op.notLike;
        case 'contains': return Op.substring;
        default: return null;
    }
}

/**
 * Converts dot-path includes (e.g., "profile.address.city") into Sequelize include tree.
 */
function buildIncludesFromPaths(paths = []) {
    const include = [];

    for (const path of paths) {
        const parts = path.split('.');
        let current = include;

        for (const part of parts) {
            let existing = current.find(i => i.association === part);
            if (!existing) {
                existing = { association: part, include: [] };
                current.push(existing);
            }
            current = existing.include;
        }
    }

    return include;
}

/**
 * Pagination plugin for Sequelize models.
 */
module.exports = (Model) => {
    Model.paginate = async function (
        filter = {},
        options = {}
    ) {
        const page = Math.max(1, parseInt(options.page, 10) || 1);
        const limit = Math.max(1, parseInt(options.limit, 10) || 10);
        const offset = (page - 1) * limit;

        // Handle sorting
        const order = options.sortBy
            ? options.sortBy.split(',').map((s) => {
                const [field, dir] = s.split(':');
                return [field.trim(), (dir || 'asc').toUpperCase()];
            })
            : [['createdAt', 'DESC']];

        if (!order.find(([field]) => field === 'id')) {
            order.push(['id', 'DESC']);
        }

        // Convert filter to Sequelize where clause
        const where = parseFilter(filter);

        // Handle nested includes
        const includePaths = options.include || [];
        const include = buildIncludesFromPaths(includePaths);

        // Run paginated query
        const { count: totalResults, rows: results } = await this.findAndCountAll({
            where,
            attributes: options.select || undefined,
            include,
            order,
            limit,
            offset,
            distinct: true, // Ensure correct count when joins are present
        });

        return {
            results,
            page,
            limit,
            totalPages: Math.ceil(totalResults / limit),
            totalResults,
        };
    };
};
