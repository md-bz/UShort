const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const factoryController = require("./factoryController");
const sharp = require("sharp");
const Url = require("../models/urlModel");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        return cb(null, true);
    }
    cb(new AppError("Not an image! please upload images only.", 400), false);
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

exports.uploadUserPhoto = upload.single("photo");

exports.deleteAllUsers = catchAsync(async (req, res) => {
    await User.deleteMany({ role: "user" });
    res.status(204).json({
        status: "success",
        data: {},
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

exports.createUser = factoryController.createOne(User);
exports.getAllUsers = factoryController.getAll(User);
exports.getUser = factoryController.getOne(User);
exports.updateUser = factoryController.updateOne(User);
exports.deleteUser = factoryController.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    const { name, password, passwordConfirm, email } = req.body;

    if (password || passwordConfirm) {
        return next(
            new AppError("This route is not for updating passwords.", 400)
        );
    }
    const data = { name, password, email };
    if (req.file) data.photo = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user._id, data, {
        new: true,
        runValidators: true,
    });

    res.status(201).json({
        status: "success",
        data: { user },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        status: "success",
        data: null,
    });
});

exports.deleteTestUsers = catchAsync(async (req, res, next) => {
    await User.deleteMany({ name: /mehrad/, role: "user" });
    await User.deleteMany({ name: /user/ });
    await User.deleteMany({ name: /test/ });
    res.status(204).json({
        status: "success",
        data: null,
    });
});
exports.getMyUrls = catchAsync(async (req, res, next) => {
    const urls = await Url.find({ user: req.user._id }, "-_id -__v");
    res.status(200).json({
        status: "success",
        data: urls,
    });
});
