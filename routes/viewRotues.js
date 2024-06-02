const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewController.getOverview);

router.get("/test", viewController.getTestPage);

module.exports = router;
