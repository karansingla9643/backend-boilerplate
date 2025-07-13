const bcrypt = require('bcryptjs');

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    comparePassword,
};