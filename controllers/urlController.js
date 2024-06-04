const Url = require("../models/urlModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

function getFullUrl(url) {
    const protocol =
        url.startsWith("http") && !url.startsWith("https") ? "http" : "https";
    const pureUrl = url.replace("https://", "").replace("http://", "");
    return `${protocol}://${pureUrl}`;
}

function convertShortUrl(req, shortUrl) {
    console.log(req.protocol + "://" + req.get("host") + "/" + shortUrl);

    return req.protocol + "://" + req.get("host") + "/" + shortUrl;
}

exports.createUrl = catchAsync(async (req, res, next) => {
    const user = req.user;
    let url = req.body.url;
    if (!url) return next(new AppError("Provide a url."));
    url = getFullUrl(url);

    const oldUrl = await Url.findOne({ url });

    if (oldUrl) {
        oldUrl.shortUrl = convertShortUrl(req, oldUrl.shortUrl);

        return res.status(200).json({
            status: "success",
            data: { url: oldUrl },
        });
    }

    const newUrl = await Url.create({ url });
    newUrl.shortUrl = convertShortUrl(req, newUrl.shortUrl);

    res.status(201).json({
        status: "success",
        data: { url: newUrl },
    });
});

exports.getUrl = catchAsync(async (req, res, next) => {
    const shortUrl = req.url.slice(1);
    console.log("wtf" + shortUrl);
    const url = await Url.findOne({ shortUrl });
    if (!url) return next(new AppError("Invalid or Expired link", 404));
    res.redirect(url.url);
});
