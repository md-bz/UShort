const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const Email = require("../utils/email");
const { hashResetToken } = require("../utils/resetPassword");
const bcrypt = require("bcryptjs");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const verifyToken = async (token) =>
    await promisify(jwt.verify)(token, process.env.JWT_SECRET);

const sendTokenResponse = (user, res, req, statuscode) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    };
    res.cookie("jwt", token, cookieOptions);

    res.status(statuscode).json({
        status: "success",
        token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();

    sendTokenResponse(newUser, res, req, 201);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        return next(new AppError("Email or password is wrong", 401));
    }

    sendTokenResponse(user, res, req, 201);
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const passwordIsMatch = await bcrypt.compare(
        req.body.oldPassword,
        user.password
    );

    if (!passwordIsMatch) {
        return next(
            new AppError(
                "Wrong password, if you have forgot password reset it!",
                401
            )
        );
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save(); // user.update({...}) wont trigger the pre-save hook for pass hashing

    sendTokenResponse(user, res, req, 201);
});

exports.protect = catchAsync(async (req, res, next) => {
    const auth = req.headers.authorization;
    let token;

    if (auth && auth.startsWith("Bearer")) {
        token = auth.split(" ")[1];
    } else if (req.cookies.jwt) token = req.cookies.jwt;

    if (req.optionalToken && !token) {
        return next();
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user)
        return next(
            new AppError(
                "this token belongs to a user that no longer exists!",
                401
            )
        );

    if (await user.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "The password has been changed. please login again",
                401
            )
        );
    }
    req.user = user;
    res.locals.user = user;
    next();
});

exports.loggedInUser = async (req, res, next) => {
    try {
        if (!req.cookies.jwt) return next();

        const token = req.cookies.jwt;
        const decoded = await verifyToken(token);
        const user = await User.findById(decoded.id);

        if (!user) return next();

        if (await user.changedPasswordAfter(decoded.iat)) {
            return next();
        }

        res.locals.user = user;
        next();
    } catch (error) {
        return next();
    }
};

exports.logout = (req, res) => {
    res.cookie("jwt", "LoggedOut", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};

exports.restrictTo = (...roles) => {
    return catchAsync(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You are not authorized to do this action!", 403)
            );
        }
        next();
    });
};

exports.tokenIsOptional = (req, res, next) => {
    req.optionalToken = true;
    next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError("there's no user with that Email", 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/reset-password/${resetToken}`;
        await new Email(user, resetUrl).sendPasswordReset(1);
        res.status(200).json({
            status: "success",
            message: "token sent to email",
        });
    } catch (error) {
        (user.passwordResetToken = undefined),
            (user.passwordResetExpires = undefined),
            await user.save();
        return next(
            new AppError("there was an error sending the email. try again", 500)
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = hashResetToken(req.params.token);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("token is not valid or is expired", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    sendTokenResponse(user, res, req, 201);
});
