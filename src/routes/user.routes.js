const express = require("express");
const upload = require("../utils/multer");
const userValidator = require("../middleware/validator");
const limiter  = require("../middleware/rateLimit");
const { auth } = require("../middleware/auth");
const {
  signUp,
  userLogin,
  resetPassword,
  forgotPassword,
  emailVerify,
  viewUserProfile,
  updateStudentProfile,
  deleteUser,
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/signup", userValidator, signUp);
router.post("/login", limiter, userLogin);
router.get("/emailVerify/:token", emailVerify );
router.post("/forgotpassword", forgotPassword );
router.get("/resetpassword/:token",  resetPassword );

router.use(auth);
router.get("/viewprofile",  viewUserProfile );
router.put("/studentUpdate", upload.fields([{ name: "picture", maxCount: 1}]), updateStudentProfile);
router.delete("/studentDeleteCourse", deleteUser)



module.exports = router;
