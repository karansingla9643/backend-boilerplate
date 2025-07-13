const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, emailService, tokenService, roleService, } = require('../services');
const ApiError = require('../utils/ApiError');
const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	maxAge: 24 * 60 * 60 * 1000, // 1 day
};
const register = catchAsync(async (req, res) => {
	const { roleId, email } = req.body;
	const existedUser = await userService.getUserByEmail(email, {});
	if (existedUser) {
		throw new ApiError(httpStatus.CONFLICT, 'This email already exits');
	}
	const role = await roleService.getRoleById(roleId);
	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	const userBody = { ...req.body, role_id: role.id };
	const user = await userService.createUser(userBody);
	const tokens = await tokenService.generateAuthTokens(user);
	delete user.password;
	res.cookie('accessToken', tokens.access.token, cookieOptions);
	res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
	const user = await authService.loginUserWithEmailAndPassword(req);
	const tokens = await tokenService.generateAuthTokens(user);
	res.cookie('accessToken', tokens.access.token, cookieOptions);
	res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
	res.cookie('accessToken', '', cookieOptions);
	res.send({ success: true });
});

const forgotPassword = catchAsync(async (req, res) => {
	const resetPasswordToken = await tokenService.generateResetPasswordToken(
		req.body.email
	);
	await emailService.sendResetPasswordEmail(
		req.body.email,
		resetPasswordToken
	);
	res.send({ success: true });
});

const resetPassword = catchAsync(async (req, res) => {
	// const { id } = await verifyToken(req.query.token);
	req.body.id = id;
	await userService.updateUser(req);
	res.send({ success: true });
});

module.exports = {
	register,
	login,
	logout,
	forgotPassword,
	resetPassword,
};
