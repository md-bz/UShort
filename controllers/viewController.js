const catchAsync = require("../utils/catchAsync");

exports.getTestPage = catchAsync(async (req, res, next) => {
    res.status(200).render("overview", { title: "Test" });
});

exports.getOverviewPage = catchAsync(async (req, res, next) => {
    res.status(200).render("overview", { title: "Shorten" });
});

exports.getLoginPage = catchAsync(async (req, res, next) => {
    res.status(200).render("login", { title: "Login" });
});

// exports.getMyUrlsPage = catchAsync(async (req, res, next) => {
//     res.status(200).render("", { title: "Login" });
// });

exports.getSignupPage = catchAsync(async (req, res, next) => {
    res.status(200).render("signup", { title: "Sign Up" });
});

exports.getMePage = catchAsync(async (req, res, next) => {
    res.status(200).render("account", { title: "Your Account" });
});
