const express = require("express");
const urlController = require("../controllers/urlController");
const { protect, tokenIsOptional } = require("../controllers/authController");

const router = express.Router();

router.route("/").post(tokenIsOptional, protect, urlController.createUrl);

router
    .route("/:shortUrl")
    .get(urlController.getUrl)
    .patch(protect, urlController.updateUrl)
    .delete(protect, urlController.deleteUrl);

module.exports = router;
