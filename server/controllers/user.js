const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const { body } = require("express-validator")
const { multerUpload } = require("../storage")
const passport = require("passport")
const { handleFormValidation } = require("../utils")
const userService = require("../services/user")
require("../strategies/jwtStrategy")
require("../strategies/googleStrategy")
require("../strategies/githubStrategy")

const upload = multerUpload("media/avatars")

const registerUserValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({ email: value })
      if (user) {
        throw new Error("Email is already used")
      }
    })
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .escape(),
]

exports.registerUser = [
  ...registerUserValidation,
  asyncHandler(async (req, res, next) => {
    handleFormValidation(req, res)
    const { name, email, password } = req.body
    await userService.registerUser(name, email, password, req.io)
    next()
  }),
]

const loginUserValidation = [
  body("email").trim().notEmpty().withMessage("Email is required").escape(),
  body("password").trim().notEmpty().withMessage("Password is required").escape(),
]

exports.loginUser = [
  ...loginUserValidation,
  asyncHandler(async (req, res) => {
    handleFormValidation(req, res)
    const { email, password } = req.body
    const token = await userService.loginUser(email, password)
    res.json({ message: "User logged in successfully", token })
  }),
]

const updateUserValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("bio").trim().isLength({ max: 300 }).withMessage("Bio cannot exceed 300 characters").optional().escape(),
]

exports.updateUser = [
  upload.single("avatar"),
  ...updateUserValidation,
  asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { name, bio, avatar } = req.body
    const updatedUser = await userService.updateUser(req.user._id, userId, name, bio, req.file, avatar)
    res.json(updatedUser)
  }),
]

exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const deletedUser = await userService.deleteUser(req.user._id, userId)
  res.json(deletedUser)
})

exports.checkUserAuth = passport.authenticate("jwt", { session: false })

exports.startGoogleLogin = passport.authenticate("google", { session: false })

exports.loginUserWithGoogle = [
  passport.authenticate("google", { session: false, failureRedirect: process.env.CLIENT_BASE_URL + "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET)
    res.redirect(process.env.CLIENT_BASE_URL + "?token=" + token)
  },
]

exports.startGithubLogin = passport.authenticate("github", { session: false })

exports.loginUserWithGithub = [
  passport.authenticate("github", { session: false, failureRedirect: process.env.CLIENT_BASE_URL + "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET)
    res.redirect(process.env.CLIENT_BASE_URL + "?token=" + token)
  },
]

exports.getMe = asyncHandler(async (req, res) => {
  const { user } = req
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }
  res.json(user)
})

exports.searchUser = asyncHandler(async (req, res) => {
  const results = await userService.searchUser(req.query.term, req.user._id)
  res.json(results)
})
