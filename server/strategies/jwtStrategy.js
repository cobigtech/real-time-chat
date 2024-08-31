const passport = require("passport")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const User = require("../models/user")

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    let user = await User.findById(payload.id).select("-password")

    if (user) {
      user = user.toObject()
      user = { ...user, _id: user._id.toString() }
      return done(null, user)
    }

    return done(null, false)
  })
)
