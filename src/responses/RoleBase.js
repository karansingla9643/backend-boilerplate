const BaseResponse = require('../db/plugins/BaseResponse.plugin');

class RoleBase extends BaseResponse {
    static fields = [
        'id',
        'name',
        'description',
    ];
}

class RoleOut extends RoleBase {
    static fields = [
        ...RoleBase.fields,
        'priority',
        'type',
        'createdAt',
    ];
}


module.exports = {
    RoleBase,
    RoleOut,
};
