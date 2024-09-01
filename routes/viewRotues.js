const express = require("express");
const viewController = require("../controllers/viewController");
const { userIsLoggedIn, protect } = require("../controllers/authController");

const router = express.Router();

router.get("/me", protect, viewController.getMePage);

router.use(userIsLoggedIn);
router.get("/", viewController.getOverviewPage);
router.get("/login", viewController.getLoginPage);

router.get("/signup", viewController.getSignupPage);

router.get("/test", viewController.getTestPage);

module.exports = router;
