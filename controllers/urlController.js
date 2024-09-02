const Url = require("../models/urlModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

function getFullUrl(url) {
    const protocol =
        url.startsWith("http") && !url.startsWith("https") ? "http" : "https";
    const pureUrl = url.replace("https://", "").replace("http://", "");
    return `${protocol}://${pureUrl}`;
}

exports.createUrl = catchAsync(async (req, res, next) => {
    const user = req.user;
    let url = req.body.url;

    if (!url) return next(new AppError("Provide a url."));
    url = getFullUrl(url);

    if (!user) {
        const oldUrl = await Url.findOne({ url });

        if (oldUrl) {
            return res.status(200).json({
                status: "success",
                data: { url: oldUrl },
            });
        }
    }
    let createQuery = user ? { url, user: user._id } : { url };

    const newUrl = await Url.create(createQuery);

    res.status(201).json({
        status: "success",
        data: { url: newUrl },
    });
});

exports.redirectUrl = catchAsync(async (req, res, next) => {
    const shortUrl = req.url.slice(1);
    const url = await Url.findOne({ shortUrl });
    if (!url) return next(new AppError("Invalid or Expired link", 404));
    res.redirect(url.url);
});
exports.getUrl = catchAsync(async (req, res, next) => {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });
    if (!url) return next(new AppError("Invalid or Expired link", 404));

    res.status(200).json({
        status: "success",
        data: url,
    });
});

exports.deleteUrl = catchAsync(async (req, res, next) => {
    const { shortUrl } = req.params;

    if (!shortUrl) return next(new AppError("Provide the short url."));

    const result = await Url.findOneAndDelete({ shortUrl, user: req.user._id });

    res.status(204).json({
        status: "success",
        data: {},
    });
});

exports.updateUrl = catchAsync(async (req, res, next) => {
    const { shortUrl } = req.params;

    console.log({
        shortUrl,
        user: req.user._id,
    });

    const { url } = req.body;
    if (!shortUrl || !url)
        return next(
            new AppError("Provide the short url and the new (long) url.")
        );

    const updateResult = await Url.findOneAndUpdate(
        {
            shortUrl,
            user: req.user._id,
        },
        { url },
        { new: true }
    );

    res.status(200).json({
        status: "success",
        data: updateResult,
    });
});
