const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { createResetToken, hashResetToken } = require("../utils/resetPassword");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
        trim: true,
        minlength: [3, "Name must have more then 3 charters"],
        maxlength: [20, "Name must have less then 20 charters"],
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Provide a valid email"],
    },
    photo: { type: String, default: "default.jpg" },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        trim: true,
        minlength: [10, "Password must be more then 10 charters"],
    },
    passwordConfirm: {
        type: String,
        required: [true, "Confirm your password"],
        // only works on create and save
        validate: {
            validator: function (element) {
                return this.password === element;
            },
            message: "Passwords aren't matched!",
        },
    },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    active: { type: Boolean, select: false, default: true },
});

userSchema.pre(/^find/, async function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.isPasswordCorrect = async (
    candidatePassword,
    userPassword
) => await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = createResetToken(32);
    this.passwordResetToken = hashResetToken(resetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
