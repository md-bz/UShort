const express = require("express");
const viewController = require("../controllers/viewController");
const { loggedInUser } = require("../controllers/authController");

const router = express.Router();

router.use(loggedInUser);
router.get("/", viewController.getOverviewPage);
router.get("/login", viewController.getLoginPage);

router.get("/signup", viewController.getSignupPage);

// router.get("/me", protect, getMePage);
router.get("/test", viewController.getTestPage);

module.exports = router;
