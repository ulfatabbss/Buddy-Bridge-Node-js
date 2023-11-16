const {
  register,
  getAllUsers,
  setAvatar,
  logOut,
  confirmRegistration,
  resendOtpVerification,
  completeUserProfile,
} = require("../controllers/userController");

const router = require("express").Router();

// router.post("/login", register);
router.post("/register", register);
router.post("/verify-registeration", confirmRegistration);
router.post("/resend-otp", resendOtpVerification);
router.post("/complte-profile", completeUserProfile);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);

module.exports = router;
