class BaseResponse {
    static fields = [];

    static serialize(item) {
        if (!item) return null;

        const json = item.toJSON ? item.toJSON() : item;
        const output = {};

        for (const field of this.fields) {
            if (json[field] !== undefined) {
                output[field] = json[field];
            }
        }

        return output;
    }

    static serializeMany(items = []) {
        return items.map(item => this.serialize(item));
    }

    static paginate(paginated) {
        return {
            ...paginated,
            results: this.serializeMany(paginated.results),
        };
    }
}

module.exports = BaseResponse;
