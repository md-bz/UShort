const express = require("express");
const urlController = require("../controllers/urlController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("*", urlController.getUrl);

module.exports = router;
