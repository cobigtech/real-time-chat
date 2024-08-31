const passport = require("passport")
const GitHubStrategy = require("passport-github2").Strategy
const User = require("../models/user")
const userService = require("../services/user")

const options = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.SERVER_BASE_URL + "/api/user/github/login",
  scope: ["user:email"],
  passReqToCallback: true,
}

passport.use(
  new GitHubStrategy(options, async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id })

      if (!user) {
        user = new User({
          provider: "github",
          githubId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        })

        await user.save()

        await userService.handleUserRegister(user._id.toString(), req.io)
      }

      user = user.toObject()
      user = { ...user, _id: user._id.toString() }

      done(null, user)
    } catch (err) {
      console.log(err)
    }
  })
)
