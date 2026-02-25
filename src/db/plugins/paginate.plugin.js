const { Op } = require('sequelize');

/**
 * Operator mapping (FastAPI parity)
 */
const OP_MAP = {
    eq: Op.eq,
    ne: Op.ne,
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    in: Op.in,
    nin: Op.notIn,
    like: Op.like,
    ilike: Op.iLike,
    notlike: Op.notLike,
    contains: Op.substring,
    isnull: 'isnull',
};

/**
 * Parses operator objects and scalar values
 */
function parseValue(value) {
    if (Array.isArray(value)) {
        return { [Op.in]: value };
    }

    if (value && typeof value === 'object') {
        const obj = {};
        for (const [op, val] of Object.entries(value)) {
            const normalized = op.replace(/^\$/, '').toLowerCase();
            const mapped = OP_MAP[normalized];

            if (!mapped) continue;

            if (mapped === 'isnull') {
                obj[Op.is] = val ? null : { [Op.not]: null };
            } else {
                obj[mapped] = val;
            }
        }
        return obj;
    }

    return value;
}

/**
 * Ensures nested Sequelize includes for dot-path filters
 */
function ensureInclude(includeMap, parts) {
    let currentLevel = includeMap;
    let path = '';

    for (const part of parts) {
        path = path ? `${path}.${part}` : part;

        if (!currentLevel.has(path)) {
            currentLevel.set(path, {
                association: part,
                required: false,
                include: [],
            });
        }

        const includeEntry = currentLevel.get(path);

        // Prepare next level map from existing include array
        const nextLevel = new Map();
        for (const inc of includeEntry.include) {
            nextLevel.set(inc.association, inc);
        }

        currentLevel = nextLevel;
        includeEntry.include = Array.from(currentLevel.values());
    }
}

/**
 * Builds Sequelize WHERE + INCLUDE from filter object
 */
function buildWhereAndInclude(filter = {}) {
    const includeMap = new Map();

    const build = (obj) => {
        const where = {};

        for (const [key, value] of Object.entries(obj)) {
            // Logical operators
            if (key === '$or' || key === '$and') {
                where[Op[key.slice(1)]] = value.map(build);
                continue;
            }

            // Dot-path filter (relation.field)
            if (key.includes('.')) {
                const parts = key.split('.');
                const field = parts.pop();
                const associationPath = parts.join('.');

                ensureInclude(includeMap, parts);

                where[`$${associationPath}.${field}$`] = parseValue(value);
                continue;
            }

            // Normal field
            where[key] = parseValue(value);
        }

        return where;
    };

    return {
        where: build(filter),
        include: Array.from(includeMap.values()),
    };
}

/**
 * Builds include tree from explicit include paths
 * (eager loading support)
 */
function buildIncludesFromPaths(paths = []) {
    const root = [];

    for (const path of paths) {
        const parts = path.split('.');
        let current = root;

        for (const part of parts) {
            let existing = current.find(i => i.association === part);
            if (!existing) {
                existing = { association: part, required: false, include: [] };
                current.push(existing);
            }
            current = existing.include;
        }
    }

    return root;
}

/**
 * Pagination plugin for Sequelize models
 */
module.exports = (Model) => {
    Model.paginate = async function paginate(
        filter = {},
        options = {}
    ) {
        const page = Math.max(1, parseInt(options.page, 10) || 1);
        const limit = Math.max(1, parseInt(options.limit, 10) || 10);
        const offset = (page - 1) * limit;

        // Sorting
        const order = options.sortBy
            ? options.sortBy.split(',').map(s => {
                const [field, dir] = s.split(':');
                return [field.trim(), (dir || 'asc').toUpperCase()];
            })
            : [['createdAt', 'DESC'], ['id', 'DESC']];

        if (!order.find(([field]) => field === 'id')) {
            order.push(['id', 'DESC']);
        }

        // Build filters (auto joins)
        const { where, include: filterIncludes } = buildWhereAndInclude(filter);

        // Explicit eager-load includes
        const eagerIncludes = buildIncludesFromPaths(options.include || []);

        // Merge includes
        const include = [...filterIncludes, ...eagerIncludes];

        const { rows: results, count: totalResults } =
            await this.findAndCountAll({
                where,
                include,
                order,
                limit,
                offset,
                distinct: true, // critical for joins
                attributes: options.select || undefined,
            });

        return {
            results,
            page,
            limit,
            totalResults,
            totalPages: Math.max(Math.ceil(totalResults / limit), 1),
        };
    };
};
