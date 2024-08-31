const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").patch(authController.resetPassword);

router.use(authController.protect);

router.route("/my-urls").get(userController.getMyUrls);

router.route("/change-password").patch(authController.changePassword);
router
    .route("/update-me")
    .patch(
        userController.uploadUserPhoto,
        userController.resizePhoto,
        userController.updateMe
    );

router.route("/delete-me").delete(userController.deleteMe);
router.route("/me").get(userController.getMe, userController.getUser);

router.use(authController.restrictTo("admin"));

router.route("/delete-tests").delete(userController.deleteTestUsers);
router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser)
    .delete(userController.deleteAllUsers);
router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
