const express = require("express");
const urlController = require("../controllers/urlController");
const { protect, tokenIsOptional } = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .post(tokenIsOptional, protect, urlController.createUrl)
    .get(urlController.getUrl);

router.use(protect);

router
    .route("/:shortUrl")
    .patch(urlController.updateUrl)
    .delete(urlController.deleteUrl);

module.exports = router;
