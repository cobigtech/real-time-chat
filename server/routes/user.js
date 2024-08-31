const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")

router.post("/register", userController.registerUser, userController.loginUser)
router.post("/login", userController.loginUser)
router.get("/google/start", userController.startGoogleLogin)
router.get("/google/login", userController.loginUserWithGoogle)
router.get("/github/start", userController.startGithubLogin)
router.get("/github/login", userController.loginUserWithGithub)
router.get("/me", userController.checkUserAuth, userController.getMe)
router.get("/search", userController.checkUserAuth, userController.searchUser)
router.put("/:userId", userController.checkUserAuth, userController.updateUser)
router.delete("/:userId", userController.checkUserAuth, userController.deleteUser)

module.exports = router
