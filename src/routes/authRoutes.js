const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/google", authController.googleAuth);
router.get("/google/callback", ...authController.googleCallback);
router.get("/logout", authController.logout);

module.exports = router;
