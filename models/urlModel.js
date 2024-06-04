const mongoose = require("mongoose");
const validator = require("validator");
const { nanoid } = require("nanoid");

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        unique: true,
        required: [true, "URL is required "],
        trim: true,
        validate: [validator.isURL, "Provide a valid URL"],
    },
    shortUrl: {
        type: String,
        unique: true,
        default: () => nanoid(10),
    },
    expire: {
        type: Date,
        default: () => Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
    },
});

urlSchema.pre(/^find/, async function (next) {
    this.find({ expire: { $gt: Date.now() } });
    next();
});

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
