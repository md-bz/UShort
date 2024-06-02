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
});

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
